import { Selection } from "monaco-editor";
import { IUser } from "./User.model";

export interface ICursorSelectionChangedEvent {
  /**
   * The primary selection.
   */
  readonly selection: Selection;
  /**
   * The secondary selections.
   */
  readonly secondarySelections: Selection[];
  /**
   * The model version id.
   */
  readonly modelVersionId: number;
  /**
   * The old selections.
   */
  readonly oldSelections: Selection[] | null;
  /**
   * The model version id the that `oldSelections` refer to.
   */
  readonly oldModelVersionId: number;
  /**
   * Source of the call that caused the event.
   */
  readonly source: string;
  /**
   * Reason.
   */
  user: IUser;
}
