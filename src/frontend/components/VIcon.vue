<script lang="ts">
import { HTMLAttributes, defineComponent } from 'vue';
const modules = import.meta.glob('../assets/icons/**/*.svg', { eager: true, as: 'svg-component' })

const reg = /\/([a-zA-Z0-9]+?)\./

const icons = new Map<string, any>(Object.entries(modules).map((([ key, item ]) => [ key.match(reg)![1], (item as any).default.render ])))

export default defineComponent((props: { icon: string } & HTMLAttributes) => {
  return icons.get(props.icon)
}, {
  props: [ "icon" ]
})
</script>
