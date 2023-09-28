<template>
  <table class="v-table" >
    <thead>
      <tr :class="{ selected: selected.size > 0 }">
        <th v-if="checkable" class="v-table__checkbox-cell">
          <div class="v-table__checkbox" @click="onSelectAllClick">
            <VIcon v-if="selected.size === props.data.length" icon="check" />
            <VIcon v-else icon="minus" />
          </div>
        </th>
        <th 
          v-for="(column, key) in props.columns" 
          :key="key" 
          :style="getStyle(column)" 
          :class="column.thClass"
        >
          {{ column.title ?? key }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="(item, index) in props.data" 
        :key="getKey(item, index)" 
        :class="{ selected: selected.has(getKey(item, index)) }"
        @click="onItemClick(item, index)"
      >
        <td v-if="checkable" class="v-table__checkbox-cell" @click.stop="selectItem(item, index)">
          <div class="v-table__checkbox" >
            <VIcon icon="check" />
          </div>
        </td>
        <td v-for="(column, key) in props.columns" :key="key" :style="getStyle(column)" :class="column.class">
          <slot :name="key" :item="item" :cell="item[key]" :index="index">
            {{ (column.map? column.map(item[key], item): item[key]) ?? column.fallback }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

type Column = {
  title?: string,
  fallback?: string,
  width?: number,
  maxWidth?: number,
  class?: string,
  thClass?: string,
  hide?: boolean,
  map?: (cell: any, item: any) => void
}

const props = defineProps<{ 
  columns: { [ key: string ]: Column },
  data: Array<any>,
  itemKey?: string,
  modelValue?: (number | string)[]
}>()

const getKey = (item: any, index: number) => {
  return props.itemKey? item[props.itemKey]: index
}

const checkable = computed(() => {
  return !!props.modelValue
})

const selected = reactive(new Set<number | string>())

const emit = defineEmits([ "update:modelValue", "itemclick" ])

const getStyle = (column: Column) => {
  return {
    width: column.width && (column.width + 'px'),
    minWidth: column.width && (column.width + 'px'),
    maxWidth: column.maxWidth && (column.maxWidth + 'px')
  }
}

watch(() => props.modelValue, (modelValue) => {
  if (!modelValue || modelValue.length === selected.size) return
  selected.clear()
  for (let item of modelValue) {
    selected.add(item)
  }
}, { deep: true })

const selectItem = (item: any, index: number) => {
  if (checkable.value) {
    const key = getKey(item, index)
    if (selected.has(key)) {
      selected.delete(key)
    } else {
      selected.add(key)
    }
    emit("update:modelValue", Array.from(selected.values()))
  }
}

const onItemClick = (item: any, index: number) => {
  emit('itemclick', item)
}

const onSelectAllClick = () => {
  if (selected.size === 0) {
    for (let i = 0; i < props.data.length; i++) {
      selected.add(getKey(props.data[i], i))
    }
  } else {
    selected.clear()
  }
  emit("update:modelValue", Array.from(selected.values()))
}

</script>

<style lang="sass">

.v-table
  border-collapse: collapse
  text-align: left
  font-size: 13px

  tr
    border-bottom: 1px solid var(--border-color)
    height: 64px

  thead tr
    height: 48px
    background-color: #FBFCFD

  tbody tr
    &:hover
      background-color: rgba(0, 0, 0, 0.02)
      cursor: pointer

  th
    color: #7B8291
    font-weight: 500
    user-select: none

  th, td
    padding: 8px 10px
    padding-left: 0px
    padding-right: 16px
    position: relative

    &:first-child
      padding-left: 20px

    &:last-child
      padding-right: 20px

  th
    padding-top: 0px
    padding-bottom: 0px

  .align-right
    text-align: right

.v-table__checkbox-cell
  width: 24px

.v-table__checkbox
  width: 20px
  height: 20px
  border: 1px solid #C6C7CA
  border-radius: 6px
  display: flex
  align-items: center
  justify-content: center
  box-sizing: border-box
  cursor: pointer

  svg
    display: none

.v-table tr.selected
  td
    background-color: #EDF5FC
  .v-table__checkbox
    border: none
    background-color: var(--primary-color)
    svg
      display: block
      color: white

.v-table .v-icon-button
  width: 40px
  height: 40px

  &:hover
    background-color: rgba(0, 0, 30, 0.04)

</style>