<script context="module" lang="ts">
    import type { Keys } from '$lib/Hotkey'
    import type { Capture as HistoryCapture } from '$lib/repo/HistoryPanel.svelte'
    import { TELEMETRY_RECORDER } from '$lib/telemetry'

    enum TabPanels {
        History,
        References,
    }

    interface Capture {
        selectedTab: number | null
        historyPanel: HistoryCapture
    }

    // Not ideal solution, [TODO] Improve Tabs component API in order
    // to expose more info about nature of switch tab / close tab actions
    function trackHistoryPanelTabAction(selectedTab: number | null, nextSelectedTab: number | null) {
        if (nextSelectedTab === 0) {
            TELEMETRY_RECORDER.recordEvent('repo.historyPanel', 'show')
            return
        }

        if (nextSelectedTab === null && selectedTab == 0) {
            TELEMETRY_RECORDER.recordEvent('repo.historyPanel', 'hide')
            return
        }
    }

    const historyHotkey: Keys = {
        key: 'alt+h',
    }

    const referenceHotkey: Keys = {
        key: 'alt+r',
    }
</script>

<script lang="ts">
    import { tick } from 'svelte'

    import { afterNavigate, goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { isErrorLike, SourcegraphURL } from '$lib/common'
    import { openFuzzyFinder } from '$lib/fuzzyfinder/FuzzyFinderContainer.svelte'
    import { filesHotkey } from '$lib/fuzzyfinder/keys'
    import Icon from '$lib/Icon.svelte'
    import KeyboardShortcut from '$lib/KeyboardShortcut.svelte'
    import LoadingSpinner from '$lib/LoadingSpinner.svelte'
    import { fetchSidebarFileTree } from '$lib/repo/api/tree'
    import HistoryPanel from '$lib/repo/HistoryPanel.svelte'
    import LastCommit from '$lib/repo/LastCommit.svelte'
    import TabPanel from '$lib/TabPanel.svelte'
    import Tabs from '$lib/Tabs.svelte'
    import Tooltip from '$lib/Tooltip.svelte'
    import { Alert, PanelGroup, Panel, PanelResizeHandle, Button } from '$lib/wildcard'
    import { getButtonClassName } from '$lib/wildcard/Button'
    import type { LastCommitFragment } from '$testing/graphql-type-mocks'

    import RepositoryRevPicker from '../RepositoryRevPicker.svelte'

    import type { LayoutData, Snapshot } from './$types'
    import FileTree from './FileTree.svelte'
    import { createFileTreeStore } from './fileTreeStore'
    import type { GitHistory_HistoryConnection, RepoPage_ReferencesLocationConnection } from './layout.gql'
    import ReferencePanel from './ReferencePanel.svelte'

    export let data: LayoutData

    export const snapshot: Snapshot<Capture> = {
        capture() {
            return {
                selectedTab,
                historyPanel: historyPanel?.capture(),
            }
        },
        async restore(data) {
            selectedTab = data.selectedTab
            // Wait until DOM was updated to possibly show the history panel
            await tick()

            // Restore history panel state if it is open
            if (data.historyPanel) {
                historyPanel?.restore(data.historyPanel)
            }
        },
    }

    let bottomPanel: Panel
    let fileTreeSidePanel: Panel
    let historyPanel: HistoryPanel
    let selectedTab: number | null = null
    let lastCommit: LastCommitFragment | null
    let commitHistory: GitHistory_HistoryConnection | null
    let references: RepoPage_ReferencesLocationConnection | null
    const fileTreeStore = createFileTreeStore({ fetchFileTreeData: fetchSidebarFileTree })

    $: ({ revision = '', parentPath, repoName, resolvedRevision } = data)
    $: fileTreeStore.set({ repoName, revision: resolvedRevision.commitID, path: parentPath })
    $: commitHistoryQuery = data.commitHistory
    $: lastCommitQuery = data.lastCommit
    $: if (!!commitHistoryQuery) {
        // Reset commit history when the query observable changes. Without
        // this we are showing the commit history of the previously selected
        // file/folder until the new commit history is loaded.
        commitHistory = null
    }

    $: if (!!lastCommitQuery) {
        // Reset last commit when the query observable changes. Without
        // this we are showing the last commit of the previously selected
        // file/folder until the last commit is loaded.
        lastCommit = null
    }

    $: commitHistory = $commitHistoryQuery?.data?.repository?.commit?.ancestors ?? null
    $: lastCommit = $lastCommitQuery?.data?.repository?.lastCommit?.ancestors?.nodes[0] ?? null

    // The observable query to fetch references (due to infinite scrolling)
    $: sgURL = SourcegraphURL.from($page.url)
    $: selectedLine = sgURL.lineRange
    $: referenceQuery =
        sgURL.viewState === 'references' && selectedLine?.line ? data.getReferenceStore(selectedLine) : null
    $: references = $referenceQuery?.data?.repository?.commit?.blob?.lsif?.references ?? null

    afterNavigate(async () => {
        // We need to wait for referenceQuery to be updated before checking its state
        await tick()

        // todo(fkling): Figure out a proper way to represent bottom panel state
        if (sgURL.viewState === 'references') {
            selectedTab = TabPanels.References
        } else if ($page.url.searchParams.has('rev')) {
            // The file view/history panel use the 'rev' parameter to specify the commit to load
            selectedTab = TabPanels.History
        } else if (selectedTab === TabPanels.References) {
            // Close references panel when navigating to a URL that doesn't have the 'references' view state
            selectedTab = null
        }
    })

    function selectTab(event: { detail: number | null }) {
        trackHistoryPanelTabAction(selectedTab, event.detail)

        if (event.detail === null) {
            handleBottomPanelCollapse().catch(() => {})
        }
        selectedTab = event.detail
    }

    function handleBottomPanelExpand() {
        if (selectedTab == null) {
            selectedTab = 0
        }
    }

    async function handleBottomPanelCollapse() {
        // Removing the URL parameter causes the diff view to close
        if ($page.url.searchParams.has('rev')) {
            const url = new URL($page.url)
            url.searchParams.delete('rev')
            await goto(url, { replaceState: true, keepFocus: true, noScroll: true })
        }
        selectedTab = null
    }

    function toggleFileSidePanel() {
        if (fileTreeSidePanel.isExpanded()) {
            fileTreeSidePanel.collapse()
        } else {
            fileTreeSidePanel.expand()
        }
    }

    $: {
        if (selectedTab == null) {
            bottomPanel?.collapse()
        } else if (!bottomPanel?.isExpanded()) {
            bottomPanel?.expand()
        }
    }
    const sidebarButtonClass = getButtonClassName({ variant: 'secondary', outline: true, size: 'sm' })
</script>

<PanelGroup id="blob-page-panels" direction="horizontal">
    <Panel
        bind:this={fileTreeSidePanel}
        id="sidebar-panel"
        order={1}
        defaultSize={1}
        minSize={15}
        maxSize={35}
        collapsible
        collapsedSize={1}
        let:isCollapsed
    >
        <div class="sidebar" class:collapsed={isCollapsed}>
            <header>
                <Tooltip tooltip="{isCollapsed ? 'Open' : 'Close'} sidebar">
                    <button class="{sidebarButtonClass} collapse-button" on:click={toggleFileSidePanel}>
                        <Icon icon={isCollapsed ? ILucidePanelLeftOpen : ILucidePanelLeftClose} inline aria-hidden />
                    </button>
                </Tooltip>

                <RepositoryRevPicker
                    repoURL={data.repoURL}
                    revision={data.revision}
                    resolvedRevision={data.resolvedRevision}
                    getRepositoryBranches={data.getRepoBranches}
                    getRepositoryCommits={data.getRepoCommits}
                    getRepositoryTags={data.getRepoTags}
                />

                <Tooltip tooltip={isCollapsed ? 'Open search fuzzy finder' : ''}>
                    <button class="{sidebarButtonClass} search-files-button" on:click={() => openFuzzyFinder('files')}>
                        {#if isCollapsed}
                            <Icon icon={ILucideSquareSlash} inline aria-hidden />
                        {:else}
                            <span>Search files</span>
                            <KeyboardShortcut shortcut={filesHotkey} />
                        {/if}
                    </button>
                </Tooltip>
            </header>

            <div class="sidebar-file-tree">
                {#if $fileTreeStore}
                    {#if isErrorLike($fileTreeStore)}
                        <Alert variant="danger">
                            Unable to fetch file tree data:
                            {$fileTreeStore.message}
                        </Alert>
                    {:else}
                        <FileTree
                            {repoName}
                            {revision}
                            treeProvider={$fileTreeStore}
                            selectedPath={data.filePath ?? ''}
                        />
                    {/if}
                {:else}
                    <LoadingSpinner center={false} />
                {/if}
            </div>
        </div>
    </Panel>

    <PanelResizeHandle id="blob-page-panels-separator" />

    <Panel id="blob-content-panels" order={2}>
        <PanelGroup id="content-panels" direction="vertical">
            <Panel id="main-content-panel" order={1}>
                <slot />
            </Panel>
            <PanelResizeHandle />
            <Panel
                bind:this={bottomPanel}
                id="bottom-actions-panel"
                order={2}
                defaultSize={1}
                minSize={20}
                maxSize={50}
                collapsible
                collapsedSize={1}
                onExpand={handleBottomPanelExpand}
                onCollapse={handleBottomPanelCollapse}
                let:isCollapsed
            >
                <div class="bottom-panel" class:collapsed={isCollapsed}>
                    <Tabs selected={selectedTab} toggable on:select={selectTab}>
                        <svelte:fragment slot="header-actions">
                            {#if !isCollapsed}
                                <Button
                                    variant="text"
                                    size="sm"
                                    aria-label="Hide bottom panel"
                                    on:click={handleBottomPanelCollapse}
                                >
                                    <Icon icon={ILucideArrowDownFromLine} inline aria-hidden /> Hide
                                </Button>
                            {/if}
                        </svelte:fragment>
                        <TabPanel title="History" shortcut={historyHotkey}>
                            {#key data.filePath}
                                <HistoryPanel
                                    bind:this={historyPanel}
                                    history={commitHistory}
                                    loading={$commitHistoryQuery?.fetching ?? true}
                                    fetchMore={commitHistoryQuery.fetchMore}
                                    enableInlineDiff={$page.data.enableInlineDiff}
                                    enableViewAtCommit={$page.data.enableViewAtCommit}
                                />
                            {/key}
                        </TabPanel>
                        <TabPanel title="References" shortcut={referenceHotkey}>
                            {#if !referenceQuery}
                                <div class="info">
                                    <Alert variant="info"
                                        >Hover over a symbol and click "Find references" to find references to the
                                        symbol.</Alert
                                    >
                                </div>
                            {:else if $referenceQuery && !$referenceQuery.fetching && (!references || references.nodes.length === 0)}
                                <div class="info">
                                    <Alert variant="info">No references found.</Alert>
                                </div>
                            {:else}
                                <ReferencePanel
                                    connection={references}
                                    loading={$referenceQuery?.fetching ?? false}
                                    on:more={referenceQuery?.fetchMore}
                                />
                            {/if}
                        </TabPanel>
                    </Tabs>
                    {#if lastCommit && isCollapsed}
                        <div class="last-commit">
                            <LastCommit {lastCommit} />
                        </div>
                    {/if}
                </div>
            </Panel>
        </PanelGroup>
    </Panel>
</PanelGroup>

<style lang="scss">
    :global([data-panel-group-id='blob-page-panels']) {
        overflow: hidden;
        background-color: var(--code-bg);
    }

    // Forcing the left sidebar panel (file-tree) to be over
    // right content panel to make sure that box-shadow of the
    // sidebar is rendered over content panel.
    :global([data-panel-id='sidebar-panel']) {
        z-index: 1;
        isolation: isolate;
        box-shadow: var(--sidebar-shadow);
        min-width: 2.92rem;
    }

    :global([data-panel-id='blob-content-panels']) {
        z-index: 0;
        isolation: isolate;
    }

    :global([data-panel-resize-handle-id='blob-page-panels-separator']) {
        &::before {
            // Even though side-panel shadow should be rendered over
            // the right content panel, resize handle still should be rendered
            // over any panel elements
            z-index: 2 !important;
        }
    }

    .sidebar {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--color-bg-1);

        header {
            display: grid;
            grid-template-columns: min-content 1fr;
            grid-template-areas:
                'collapse-button rev-picker'
                'search-files search-files';
            gap: 0.375rem;
            padding: 0.5rem;

            .collapse-button {
                grid-area: collapse-button;
            }

            :global([data-repo-rev-picker-trigger]) {
                grid-area: rev-picker;
                min-width: 0;
            }

            .search-files-button {
                grid-area: search-files;

                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.25rem;

                span {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    flex-grow: 1;
                    flex-shrink: 1;
                    text-align: left;
                }
            }
        }

        .sidebar-file-tree {
            flex-grow: 1;
            min-height: 0;
            overflow: auto;
            padding: 0.25rem 0 0.5rem 0;
            border-top: 1px solid var(--border-color);
        }

        &.collapsed {
            header {
                grid-template-columns: min-content;
                grid-template-areas:
                    'collapse-button'
                    'search-files';

                :global([data-repo-rev-picker-trigger]) {
                    display: none;
                }

                .search-files-button span {
                    display: none;
                }
            }
            .sidebar-file-tree {
                display: none;
            }
        }
    }

    :global([data-panel-id='main-content-panel']) {
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
    }

    :global([data-panel-id='bottom-actions-panel']) {
        min-height: 2.5625rem; // 41px which is bottom panel compact size
        box-shadow: var(--bottom-panel-shadow);
    }

    .bottom-panel {
        --align-tabs: flex-start;

        display: flex;
        align-items: center;
        gap: 2rem;
        justify-content: space-between;
        overflow: hidden;
        height: 100%;
        background-color: var(--color-bg-1);
        color: var(--text-body);

        :global([data-tabs]) {
            flex: 1;
            min-width: 0;
        }

        &.collapsed :global([data-tabs]) {
            // Reset min-width otherwise very long commit messages will overflow
            // the tabs.
            min-width: initial;
        }

        .last-commit {
            min-width: 0;
            max-width: min-content;
            margin-right: 0.5rem;
        }
    }

    .info {
        padding: 1rem;
    }
</style>
