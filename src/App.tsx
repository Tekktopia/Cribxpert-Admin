import { Provider } from "react-redux";
import { store } from "./store";
import { DashboardPage } from "./pages/Dashboard";

function App() {
  return (
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
}

export default App;
