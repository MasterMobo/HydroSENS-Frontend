import { BrowserRouter, Route, Routes } from "react-router-dom";
import MapPage from "./pages/MapPage/MapPage";
import { Provider } from "react-redux";
import { store } from "./redux/store";

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MapPage />} />
                    <Route path="*" element={<MapPage />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
