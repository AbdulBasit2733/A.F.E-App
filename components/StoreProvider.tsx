import { Provider } from "react-redux";
import store from "../redux/store"; // Adjust the path if necessary

const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
