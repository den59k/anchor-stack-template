import { Plugin } from "vue"
import VButton from "./components/VButton.vue"
import VCard from "./components/VCard.vue"
import VDialogActions from "./components/VDialogActions.vue"
import VDialogHeader from "./components/VDialogHeader.vue"
import VFormControl from "./components/VFormControl.vue"
import VIcon from "./components/VIcon.vue"
import VIconButton from "./components/VIconButton.vue"
import VInput from "./components/VInput.vue"
import VTable from "./components/VTable.vue"

export const registerComponents: Plugin = {
  install: (app) => {
    app.component("VButton", VButton)
    app.component("VCard", VCard)
    app.component("VDialogActions", VDialogActions)
    app.component("VDialogHeader", VDialogHeader)
    app.component("VFormControl", VFormControl)
    app.component("VIcon", VIcon)
    app.component("VIconButton", VIconButton)
    app.component("VInput", VInput)
    app.component("VTable", VTable)
  }
}

export type IconType = "check"


declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    VButton: typeof import("./components/VButton.vue")["default"]
    VCard: typeof import("./components/VCard.vue")["default"]
    VDialogActions: typeof import("./components/VDialogActions.vue")["default"]
    VDialogHeader: typeof import("./components/VDialogHeader.vue")["default"]
    VFormControl: typeof import("./components/VFormControl.vue")["default"]
    VIcon: typeof import("./components/VIcon.vue")["default"]
    VIconButton: typeof import("./components/VIconButton.vue")["default"]
    VInput: typeof import("./components/VInput.vue")["default"]
    VTable: typeof import("./components/VTable.vue")["default"]
  }
}
