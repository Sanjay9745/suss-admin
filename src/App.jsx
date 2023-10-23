import { Route, Routes } from "react-router-dom"
import Login from "./components/Login/Login"
import DashBoard from "./components/Dashboard/DashBoard"
import AddUser from "./components/AddUser/AddUser"
import AllUsers from "./components/AllUsers/AllUsers"
import EditUser from "./components/Edituser/EditUser"
import AllProducts from "./components/AllProducts/AllProducts"
import EditProduct from "./components/EditProduct/EditProduct"
import AllVariations from "./components/AllVariations/AllVariations"
import EditVariation from "./components/EditVariation/EditVariation"
import LoadScriptOnRouteChange from "./config/LoadScriptOnRouteChange"
import AddCategory from "./components/AddCategory/AddCategory"


function App() {


  return (
    <>
     <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashBoard />} />
      <Route path="/add-user" element={<AddUser />} />
      <Route path="/all-users" element={<AllUsers />} />
      <Route path="/edit-user/:id" element={<EditUser/>} />
    <Route path="/all-products" element={<AllProducts/>} />
    <Route path="/edit-product/:id" element={<EditProduct/>} />
    <Route path="/all-variations/:id" element={<AllVariations/>} />
    <Route path="/edit-variation/:id" element={<EditVariation/>} />
    <Route path="/category" element={<AddCategory/>} />

     </Routes>
     <LoadScriptOnRouteChange scriptSrc="/src/assets/js/template.js" />
    </>
  )
}

export default App
