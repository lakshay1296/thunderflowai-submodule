import { useDispatch } from "react-redux";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import Layout from "./components/Layout";
import { SubmenuContextProvidersContext } from "./context/SubmenuContextProviders";
import { VscThemeContext } from "./context/VscTheme";
import useSetup from "./hooks/useSetup";
import useSubmenuContextProviders from "./hooks/useSubmenuContextProviders";
import { useVscTheme } from "./hooks/useVscTheme";
import { AddNewModel, ConfigureProvider } from "./pages/AddNewModel";
import ErrorPage from "./pages/error";
import GUI from "./pages/gui";
import { default as Help, default as HelpPage } from "./pages/help";
import History from "./pages/history";
import MigrationPage from "./pages/migration";
import MonacoPage from "./pages/monaco";
import ApiKeyAutocompleteOnboarding from "./pages/onboarding/apiKeyAutocompleteOnboarding";
import ApiKeysOnboarding from "./pages/onboarding/ApiKeysOnboarding";
import LocalOnboarding from "./pages/onboarding/LocalOnboarding";
import Onboarding from "./pages/onboarding/Onboarding";
import SettingsPage from "./pages/settings";
import Stats from "./pages/stats";
import Inventory from "./pages/inventory";
import PerplexityGUI from "./integrations/perplexity/perplexitygui";
import Welcome from "./pages/welcome/welcomeGui";
import { ContextMenuProvider } from './components/ContextMenuProvider';
import Mem0GUI from "./integrations/mem0/mem0gui";
// import PerplexitySidebarGUI from "./integrations/perplexity/PerplexitySidebarGUI";
import Mem0SidebarGUI from "./integrations/mem0/Mem0SidebarGUI";


declare global {
  interface Window {
    initialRoute?: string;
    isFirstLaunch?: boolean;
    isThunderflowOverlay?: boolean;
    viewType?: 'thunderflowai.chatView' | 'thunderflowai.mem0View' | 'thunderflowai.searchView';
  }
}

const router = createMemoryRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/index.html",
          element: <GUI />,
        },
        {
          path: "/",
          element: window.viewType === 'thunderflowai.chatView' ? <GUI /> :
                   window.viewType === 'thunderflowai.searchView' ? <PerplexityGUI /> :
                   window.viewType === 'thunderflowai.mem0View' ? <Mem0SidebarGUI /> :
                  <GUI />, // default to GUI if viewType is undefined or different

        },
        {
          path: "/perplexityMode",
          element: <PerplexityGUI />,
        },
        {
          path: "/history",
          element: <History from={
            window.viewType === 'thunderflowai.chatView' ? 'continue' :
            window.viewType === 'thunderflowai.searchView' ? 'perplexity' :
            'continue' // default fallback
          }/>
        },
        {
          path: "/stats",
          element: <Stats />,
        },
        {
          path: "/help",
          element: <Help />,
        },
        {
          path: "/settings",
          element: <SettingsPage />,
        },
        {
          path: "/addModel",
          element: <AddNewModel />,
        },
        {
          path: "/addModel/provider/:providerName",
          element: <ConfigureProvider />,
        },
        {
          path: "/help",
          element: <HelpPage />,
        },
        {
          path: "/monaco",
          element: <MonacoPage />,
        },
        {
          path: "/onboarding",
          element: <Onboarding />,
        },
        {
          path: "/localOnboarding",
          element: <LocalOnboarding />,
        },
        {
          path: "/migration",
          element: <MigrationPage />,
        },
        {
          path: "/apiKeysOnboarding",
          element: <ApiKeysOnboarding />,
        },
        {
          path: "/apiKeyAutocompleteOnboarding",
          element: <ApiKeyAutocompleteOnboarding />,
        },
        {
          path: "/inventory/*",
          element: <Inventory />,
        },
        {
          path: "/welcome",
          element: <Welcome/>
        },
      ],
    },
  ],
  // TODO: Remove replace /welcome with /inventory when done testing
  {
    initialEntries: [
      window.isThunderflowOverlay
        ? (window.isFirstLaunch ? "/welcome" : "/inventory/home")
        : window.initialRoute
    ],
    // FOR DEV'ing welcome:
    // initialEntries: [window.isThunderflowOverlay ? "/welcome" : window.initialRoute],
  },

);




function App() {
  const dispatch = useDispatch();
  useSetup(dispatch);

  const vscTheme = useVscTheme();
  const submenuContextProvidersMethods = useSubmenuContextProviders();
  return (
    <ContextMenuProvider>
      <VscThemeContext.Provider value={vscTheme}>
        <SubmenuContextProvidersContext.Provider
          value={submenuContextProvidersMethods}
        >
          <RouterProvider router={router} />
        </SubmenuContextProvidersContext.Provider>
      </VscThemeContext.Provider>
    </ContextMenuProvider>
  );
}

export default App;
