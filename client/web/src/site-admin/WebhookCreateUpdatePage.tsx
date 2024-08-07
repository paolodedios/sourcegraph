import React, { type FC, useCallback, useMemo, useState } from 'react'

import { noop } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { useMutation, useQuery } from '@sourcegraph/http-client'
import { Alert, Button, ButtonLink, Container, ErrorAlert, Form, Input, Select } from '@sourcegraph/wildcard'

import { defaultExternalServices } from '../components/externalServices/externalServices'
import { ConnectionLoading } from '../components/FilteredConnection/ui'
import {
    type CreateWebhookResult,
    type CreateWebhookVariables,
    ExternalServiceKind,
    type WebhookExternalServicesResult,
    type WebhookExternalServicesVariables,
    type UpdateWebhookResult,
    type UpdateWebhookVariables,
    type WebhookFields,
} from '../graphql-operations'
import { generateSecret } from '../util/security'

import { CREATE_WEBHOOK_QUERY, UPDATE_WEBHOOK_QUERY, WEBHOOK_EXTERNAL_SERVICES } from './backend'

import styles from './WebhookCreateUpdatePage.module.scss'

interface WebhookCreateUpdatePageProps {
    // existingWebhook is present when this page is used as an update page.
    existingWebhook?: WebhookFields
}

export interface Webhook {
    name: string
    codeHostKind: ExternalServiceKind | null
    codeHostURN: string
    secret: string | null
}

export const WebhookCreateUpdatePage: FC<WebhookCreateUpdatePageProps> = ({ existingWebhook }) => {
    const navigate = useNavigate()
    const update = existingWebhook !== undefined
    const initialWebhook = update
        ? {
              name: existingWebhook.name,
              codeHostKind: existingWebhook.codeHostKind,
              codeHostURN: existingWebhook.codeHostURN,
              secret: existingWebhook.secret,
          }
        : {
              name: '',
              codeHostKind: null,
              codeHostURN: '',
              secret: null,
          }

    const [webhook, setWebhook] = useState<Webhook>(initialWebhook)
    const [kindsToUrls, setKindsToUrls] = useState<Map<ExternalServiceKind, Set<string>>>(new Map())

    const { loading, data, error } = useQuery<WebhookExternalServicesResult, WebhookExternalServicesVariables>(
        WEBHOOK_EXTERNAL_SERVICES,
        {}
    )
    useMemo(() => {
        if (!data) {
            return
        }

        const kindToUrlMap = new Map<ExternalServiceKind, Set<string>>()

        for (const extSvc of data.externalServices.nodes) {
            if (!supportedExternalServiceKind(extSvc.kind)) {
                continue
            }
            if (!kindToUrlMap.has(extSvc.kind)) {
                kindToUrlMap.set(extSvc.kind, new Set())
            }
            kindToUrlMap.get(extSvc.kind)!.add(extSvc.url)
        }

        setKindsToUrls(kindToUrlMap)

        // If there are no external services, then the warning is shown and webhook creation is blocked.
        // At this point we can only have external services with existing URL which existence is enforced
        // by the code host configuration schema.
        if (kindToUrlMap.size !== 0) {
            // only fill the initial values for webhook creation
            if (!update) {
                const [currentKind] = kindToUrlMap.keys()
                const [currentUrls] = kindToUrlMap.values()
                // we always generate a secret once and assign it to the webhook. Bitbucket Cloud special case
                // is handled is an Input and during GraphQL query creation.
                setWebhook(webhook => ({
                    ...webhook,
                    secret: generateSecret(),
                    codeHostURN: Array.from(currentUrls)[0],
                    codeHostKind: currentKind,
                }))
            }
        }
    }, [data, update])

    const onCodeHostTypeChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(
        event => {
            const selected = event.target.value as ExternalServiceKind
            const selectedUrns = kindsToUrls.get(selected)
            // This cannot happen, because the form is not rendered when there are no created external services
            // which support webhooks (and effectively have URLs in their code host configurations).
            if (!selectedUrns || selectedUrns.size === 0) {
                throw new Error(
                    `${defaultExternalServices[selected].title} code host connection has no URL. Please check related code host configuration.`
                )
            }
            const selectedUrn = Array.from(selectedUrns)[0]
            setWebhook(webhook => ({
                ...webhook,
                codeHostKind: selected,
                codeHostURN: selectedUrn,
            }))
        },
        [kindsToUrls]
    )
    const onCodeHostUrnChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(event => {
        setWebhook(webhook => ({ ...webhook, codeHostURN: event.target.value }))
    }, [])
    const onNameChange = useCallback((name: string): void => {
        setWebhook(webhook => ({ ...webhook, name }))
    }, [])
    const onSecretChange = useCallback((secret: string): void => {
        setWebhook(webhook => ({ ...webhook, secret: secret.length === 0 ? null : secret }))
    }, [])
    const [createWebhook, { error: createWebhookError, loading: creationLoading }] = useMutation<
        CreateWebhookResult,
        CreateWebhookVariables
    >(CREATE_WEBHOOK_QUERY, { onCompleted: data => navigate(`/site-admin/webhooks/incoming/${data.createWebhook.id}`) })

    const [updateWebhook, { error: updateWebhookError, loading: updateLoading }] = useMutation<
        UpdateWebhookResult,
        UpdateWebhookVariables
    >(UPDATE_WEBHOOK_QUERY, {
        onCompleted: data => navigate(`/site-admin/webhooks/incoming/${data.updateWebhook.id}`),
    })

    if (loading) {
        return <ConnectionLoading />
    }

    if (error) {
        return <ErrorAlert error={error} />
    }

    if (!data) {
        // Should not happen.
        return null
    }

    if (kindsToUrls.size === 0) {
        return (
            <Alert variant="warning" className="mt-2">
                Please add a code host connection in order to create a webhook.
            </Alert>
        )
    }

    return (
        <Form
            onSubmit={event => {
                event.preventDefault()
                if (update) {
                    updateWebhook({
                        variables: buildUpdateWebhookVariables(webhook, existingWebhook?.id),
                    }).catch(
                        // noop here is used because update error is handled directly when useMutation is called
                        noop
                    )
                    return
                }
                createWebhook({ variables: convertWebhookToCreateWebhookVariables(webhook) }).catch(
                    // noop here is used because creation error is handled directly when useMutation is called
                    noop
                )
            }}
        >
            <Container className="mb-2">
                <div className={styles.form}>
                    <Input
                        label="Webhook name"
                        pattern="^[a-zA-Z0-9_'\-\/\.\s]+$"
                        required={true}
                        defaultValue={update ? webhook.name : ''}
                        onChange={event => {
                            onNameChange(event.target.value)
                        }}
                        maxLength={100}
                    />
                    <Select
                        id="code-host-type-select"
                        label="Code host type"
                        required={true}
                        defaultValue={webhook.codeHostKind?.toString()}
                        onChange={onCodeHostTypeChange}
                        disabled={loading}
                    >
                        {Array.from(kindsToUrls.keys()).map(kind => (
                            <option value={kind} key={kind}>
                                {defaultExternalServices[kind].title}
                            </option>
                        ))}
                    </Select>
                    <Select
                        id="code-host-urn-select"
                        label="Code host URN"
                        required={true}
                        defaultValue={webhook.codeHostURN}
                        onChange={onCodeHostUrnChange}
                        disabled={loading || !webhook.codeHostKind}
                    >
                        {webhook.codeHostKind &&
                            kindsToUrls.has(webhook.codeHostKind) &&
                            Array.from(kindsToUrls.get(webhook.codeHostKind)!).map(urn => (
                                <option value={urn} key={urn}>
                                    {urn}
                                </option>
                            ))}
                    </Select>
                    <Input
                        className="mb-0"
                        message={
                            webhook.codeHostKind && !codeHostSupportsSecrets(webhook.codeHostKind) ? (
                                <>Code Host doesn't support secrets.</>
                            ) : (
                                <>Randomly generated. Alter as required.</>
                            )
                        }
                        label="Secret"
                        disabled={webhook.codeHostKind !== null && !codeHostSupportsSecrets(webhook.codeHostKind)}
                        // TODO: Is this pattern too prohibitive? It doesn't even allow `-`.
                        pattern="^[a-zA-Z0-9]+$"
                        onChange={event => {
                            onSecretChange(event.target.value)
                        }}
                        value={
                            webhook.codeHostKind && !codeHostSupportsSecrets(webhook.codeHostKind)
                                ? ''
                                : webhook.secret || ''
                        }
                        maxLength={100}
                    />
                </div>
            </Container>
            <div className="d-flex flex-shrink-0 mb-3">
                {update ? (
                    <>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={updateLoading || webhook.name.trim() === ''}
                            className="mr-1"
                        >
                            Update
                        </Button>
                        <ButtonLink to={`/site-admin/webhooks/incoming/${existingWebhook.id}`} variant="secondary">
                            Cancel
                        </ButtonLink>
                    </>
                ) : (
                    <Button type="submit" variant="primary" disabled={creationLoading || webhook.name.trim() === ''}>
                        Create
                    </Button>
                )}
            </div>
            {(createWebhookError || updateWebhookError) && (
                <ErrorAlert
                    className="mb-3"
                    prefix={`Failed to ${createWebhookError ? 'create' : 'update'} webhook`}
                    error={createWebhookError || updateWebhookError}
                />
            )}
        </Form>
    )
}

function supportedExternalServiceKind(kind: ExternalServiceKind): boolean {
    switch (kind) {
        case ExternalServiceKind.BITBUCKETSERVER: {
            return true
        }
        case ExternalServiceKind.BITBUCKETCLOUD: {
            return true
        }
        case ExternalServiceKind.GITHUB: {
            return true
        }
        case ExternalServiceKind.GITLAB: {
            return true
        }
        case ExternalServiceKind.AZUREDEVOPS: {
            return true
        }
        default: {
            return false
        }
    }
}

function buildUpdateWebhookVariables(webhook: Webhook, id?: string): UpdateWebhookVariables {
    const secret =
        webhook.codeHostKind !== null && !codeHostSupportsSecrets(webhook.codeHostKind) ? null : webhook.secret

    return {
        // should not happen when update is called
        id: id || '',
        name: webhook.name,
        codeHostKind: webhook.codeHostKind || ExternalServiceKind.OTHER,
        codeHostURN: webhook.codeHostURN,
        secret,
    }
}

function convertWebhookToCreateWebhookVariables(webhook: Webhook): CreateWebhookVariables {
    const secret =
        webhook.codeHostKind !== null && !codeHostSupportsSecrets(webhook.codeHostKind) ? null : webhook.secret
    return {
        name: webhook.name,
        codeHostKind: webhook.codeHostKind || ExternalServiceKind.OTHER,
        codeHostURN: webhook.codeHostURN,
        secret,
    }
}

function codeHostSupportsSecrets(codeHostKind: ExternalServiceKind): boolean {
    if (codeHostKind === ExternalServiceKind.AZUREDEVOPS) {
        return false
    }
    return true
}
