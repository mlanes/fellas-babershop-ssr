import type { MaybeRefOrGetter } from 'vue'

/**
 * Gives a page a title of its own, shown in the browser tab and in the preview
 * of a shared link alike. A page that does not call this gets the site's title.
 *
 * @param title - the title, or a function returning it when it depends on the
 *   language being read
 */
export function usePageTitle(title: MaybeRefOrGetter<string>) {
  useSeoMeta({
    title: () => toValue(title),
    ogTitle: () => toValue(title),
    twitterTitle: () => toValue(title),
  })
}
