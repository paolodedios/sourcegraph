import { StatusCompletion, StatusResult } from '@sourcegraph/extension-api-classes'
import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import AlertCircleOutlineIcon from 'mdi-react/AlertCircleOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import CloseIcon from 'mdi-react/CloseIcon'
import React from 'react'
import * as sourcegraph from 'sourcegraph'

const isCompleted = (
    state: sourcegraph.Status['state']
): state is { completion: sourcegraph.StatusCompletion; result: sourcegraph.StatusResult } =>
    state.completion === StatusCompletion.Completed

const iconForStatusResult = (
    result: sourcegraph.StatusResult
): { icon: React.ComponentType<{ className?: string }>; className: string } => {
    switch (result) {
        case StatusResult.Success:
            return { icon: CheckIcon, className: 'text-success' }
        case StatusResult.Failure:
            return { icon: CloseIcon, className: 'text-failure' }
        case StatusResult.ActionRequired:
            return { icon: AlertCircleOutlineIcon, className: 'text-info' }
    }
}

interface Props {
    state: sourcegraph.Status['state']
    className?: string
}

/**
 * An icon that conveys the state and result of a status.
 */
export const StatusStateIcon: React.FunctionComponent<Props> = ({ state, className = '' }) => {
    if (isCompleted(state)) {
        const { icon: Icon, className: resultClassName } = iconForStatusResult(state.result)
        return <Icon className={`${className} ${resultClassName}`} />
    }
    return <LoadingSpinner className={className} />
}
