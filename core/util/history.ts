import * as fs from "fs";
import { PersistedSessionInfo, SessionInfo, IntegrationType, IntegrationHistoryMap } from "../index.js";
import { ListHistoryOptions } from "../protocol/core.js";
import { getSessionFilePath, getSessionsListPath } from "./paths.js";

class HistoryManager {
  private readonly integrationHistoryTypes: IntegrationHistoryMap = {
    history: 'continue',
    perplexityHistory: 'perplexity',
  };

  getHistoryType(session: PersistedSessionInfo): IntegrationType {
    // Type-safe way to check histories
    for (const key of Object.keys(this.integrationHistoryTypes) as (keyof IntegrationHistoryMap)[]) {
      if (session[key]?.length > 0) {
        return this.integrationHistoryTypes[key];
      }
    }
    return 'continue'; // Default to main if no histories found
  };

  list(options: ListHistoryOptions): SessionInfo[] {
    const filepath = getSessionsListPath();
    if (!fs.existsSync(filepath)) {
      return [];
    }
    const content = fs.readFileSync(filepath, "utf8");
    let sessions = JSON.parse(content).filter((session: any) => {
      // Filter out old format
      return typeof session.session_id !== "string";
    });

    // Apply limit and offset
    if (options.limit) {
      const offset = options.offset || 0;
      sessions = sessions.slice(offset, offset + options.limit);
    }
    return sessions;
  }

  delete(sessionId: string) {
    // Delete a session
    const sessionFile = getSessionFilePath(sessionId);
    if (!fs.existsSync(sessionFile)) {
      throw new Error(`Session file ${sessionFile} does not exist`);
    }
    fs.unlinkSync(sessionFile);

    // Read and update the sessions list
    const sessionsListFile = getSessionsListPath();
    const sessionsListRaw = fs.readFileSync(sessionsListFile, "utf-8");
    let sessionsList: SessionInfo[];
    try {
      sessionsList = JSON.parse(sessionsListRaw);
    } catch (error) {
      throw new Error(
        `It looks like there is a JSON formatting error in your sessions.json file (${sessionsListFile}). Please fix this before creating a new session.`,
      );
    }

    sessionsList = sessionsList.filter(
      (session) => session.sessionId !== sessionId,
    );

    fs.writeFileSync(sessionsListFile, JSON.stringify(sessionsList));
  }

  load(sessionId: string): PersistedSessionInfo {
    try {
      const sessionFile = getSessionFilePath(sessionId);
      if (!fs.existsSync(sessionFile)) {
        throw new Error(`Session file ${sessionFile} does not exist`);
      }
      const session: PersistedSessionInfo = JSON.parse(
        fs.readFileSync(sessionFile, "utf8"),
      );
      session.sessionId = sessionId;
      return session;
    } catch (e) {
      console.log(`Error loading session: ${e}`);
      return {
        history: [],
        perplexityHistory: [],
        title: "Failed to load session",
        workspaceDirectory: "",
        sessionId: sessionId,
      };
    }
  }

  save(session: PersistedSessionInfo) {
    // Save the main session json file
    fs.writeFileSync(
      getSessionFilePath(session.sessionId),
      JSON.stringify(session),
    );

    // Read and update the sessions list
    const sessionsListFilePath = getSessionsListPath();
    try {
      const rawSessionsList = fs.readFileSync(sessionsListFilePath, "utf-8");

      let sessionsList: SessionInfo[];
      try {
        sessionsList = JSON.parse(rawSessionsList);
      } catch (e) {
        if (rawSessionsList.trim() === "") {
          fs.writeFileSync(sessionsListFilePath, JSON.stringify([]));
          sessionsList = [];
        } else {
          throw e;
        }
      }

      // todo: add a parameter to indicate integration type of session
      let found = false;
      for (const sessionInfo of sessionsList) {
        if (sessionInfo.sessionId === session.sessionId) {
          sessionInfo.title = session.title;
          sessionInfo.workspaceDirectory = session.workspaceDirectory;
          sessionInfo.integrationType = this.getHistoryType(session); // return integration type;
          found = true;
          break;
        }
      }

      if (!found) {
        const sessionInfo: SessionInfo = {
          sessionId: session.sessionId,
          title: session.title,
          dateCreated: String(Date.now()),
          workspaceDirectory: session.workspaceDirectory,
          integrationType: this.getHistoryType(session),
        };
        sessionsList.push(sessionInfo);
      }

      fs.writeFileSync(sessionsListFilePath, JSON.stringify(sessionsList));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `It looks like there is a JSON formatting error in your sessions.json file (${sessionsListFilePath}). Please fix this before creating a new session.`,
        );
      }
      throw new Error(
        `It looks like there is a validation error in your sessions.json file (${sessionsListFilePath}). Please fix this before creating a new session. Error: ${error}`,
      );
    }
  }
}

const historyManager = new HistoryManager();

export default historyManager;
