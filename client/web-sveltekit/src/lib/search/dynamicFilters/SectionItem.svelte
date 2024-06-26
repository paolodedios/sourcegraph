<script lang="ts">
    import { page } from '$app/stores'
    import Icon from '$lib/Icon.svelte'

    import CountBadge from './CountBadge.svelte'
    import { updateFilterInURL, type SectionItemData } from './index'

    export let item: SectionItemData
    export let onFilterSelect: (kind: SectionItemData['kind']) => void = () => {}
</script>

<a
    href={updateFilterInURL($page.url, item, item.selected).toString()}
    class:selected={item.selected}
    on:click={() => onFilterSelect(item.kind)}
>
    <slot name="icon" />
    <span class="label">
        <slot name="label" label={item.label} value={item.value}>
            {item.label}
        </slot>
    </span>
    <CountBadge count={item.count} exhaustive={item.exhaustive} />
    {#if item.selected}
        <span class="close">
            <Icon icon={ILucideX} inline aria-hidden />
        </span>
    {/if}
</a>

<style lang="scss">
    a {
        --icon-color: currentColor;

        display: flex;
        width: 100%;
        align-items: center;
        border: none;
        text-align: left;
        text-decoration: none;
        border-radius: var(--border-radius);
        color: inherit;
        white-space: nowrap;
        gap: 0.5rem;

        padding: 0.25rem 0.5rem;
        margin: 0;
        font-weight: 400;

        .label {
            flex: 1;
            text-overflow: ellipsis;
            overflow: hidden;
            color: var(--text-body);
        }

        &:hover {
            background-color: var(--color-bg-3);

            .label {
                color: var(--text-title);
            }
        }

        &.selected {
            // Explicitly override icon color to ensure that icons with custom colors
            // are visible on the primary background
            --file-icon-color: currentColor;

            background-color: var(--primary);
            color: var(--light-text);

            .label {
                color: var(--light-text);
            }
        }

        .close {
            flex-shrink: 0;
        }
    }
</style>
