import { IUser } from "./User.model";
import * as monaco from "monaco-editor";
export class ContentWidget {
  user: IUser;
  domNode: HTMLElement | null = null;
  position = {
    lineNumber: 0,
    column: 0,
  };
  constructor(user: IUser) {
    this.user = user;
  }
  getPosition(): monaco.editor.IContentWidgetPosition {
    return {
      position: this.position,
      preference: [
        monaco.editor.ContentWidgetPositionPreference.ABOVE,
        monaco.editor.ContentWidgetPositionPreference.BELOW,
      ],
    };
  }
  getId(): string {
    return "content." + this.user.id;
  }
  getDomNode(): HTMLElement {
    if (!this.domNode) {
      const domNode = document.createElement("div");
      const styles = {
        background: this.user.color! + "60",
        color: "#999",
        opacity: 0.75,
        width: "max-content",
        padding: "0 2px",
      };
      Object.assign(domNode.style, styles);
      domNode.innerHTML = this.user.name!;
      this.domNode = domNode;
    }
    return this.domNode;
  }
}
