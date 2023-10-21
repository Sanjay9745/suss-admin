import NavBar from "../NavBar/NavBar";
import SideBar from "../SideBar/SideBar";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "../../config/SERVER_URL";

function AllVariations() {
    const {id} = useParams();
  const navigate = useNavigate();
const [variations,setVariations]=useState([])
  const [name, setName] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    axios
      .get(`${SERVER_URL}/admin/protected`, {
        headers: { "x-access-token": token },
      })
      .then((res) => {
        if (res.status === 200) {
          axios
            .get(`${SERVER_URL}/product/get-product-with-variation/${id}`, {
              headers: { "x-access-token": token },
            })
            .then((userResponse) => {
              if (userResponse.status === 200) {
                setVariations(userResponse?.data);
              }
            })
            .catch((err) => {
              console.log(err.response.data);
            });
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    axios
      .get(
        `${SERVER_URL}/product/get-product-with-variation/${id}`,
        { headers: { "x-access-token": localStorage.getItem("token") } }
      )
      .then((userResponse) => {
        if (userResponse.status === 200) {
          setVariations(userResponse?.data.variations);
        }
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }, [name]);

  function handleDelete(variationId) {
    axios
      .post(
        `${SERVER_URL}/admin/delete-variation`,
        { variationId: variationId,productId:id},
        { headers: { "x-access-token": localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.status === 200) {
            setVariations(variations?.filter((variation) => variation._id !== variationId));
        }
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }
console.log(variations);
  return (
    <>
      <div className="main-wrapper">
        <SideBar />
        <div className="page-wrapper">
          <NavBar name={name} setName={setName} link="all-variations" />
          <div className="page-content">
            <div className="row">
              <div className="col-md-12 grid-margin stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Data Table</h6>

                    <div className="table-responsive">
                      <table id="dataTableExample" className="table">
                        <thead>
                          <tr>
                            <th>Color</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Edit</th>
                            <th>Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variations?.map((variation) => (
                            <tr key="">
                              <th>{variation?.color}</th>
                              <th>{variation?.size}</th>
                              <th>{variation?.price}</th>
                              <th>
                                <p
                                  className="btn btn-primary"
                                  onClick={() =>
                                    navigate("/edit-variation/" + variation._id)
                                  }
                                >
                                  Edit
                                </p>
                              </th>
                              <th>
                                <p
                                  className="btn btn-danger"
                              onClick={()=>handleDelete(variation._id)}
                                >
                                  Delete
                                </p>
                              </th>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AllVariations;
