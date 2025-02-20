import type { ContextItemWithId, IndexingProgressUpdate } from "../index.js";

export type ToWebviewFromIdeOrCoreProtocol = {
  configUpdate: [undefined, void];
  getDefaultModelTitle: [undefined, string];
  loadMostRecentChat: [undefined, void];
  indexProgress: [IndexingProgressUpdate, void];
  refreshSubmenuItems: [undefined, void];
  isContinueInputFocused: [undefined, boolean];
  pearAISignedIn: [undefined, void];
  switchModel: [string, void];
  addContextItem: [
    {
      historyIndex: number;
      item: ContextItemWithId;
    },
    void,
  ];
};
