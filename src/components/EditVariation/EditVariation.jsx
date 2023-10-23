import { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import SideBar from "../SideBar/SideBar";
import axios from "axios";
import SERVER_URL from "../../config/SERVER_URL";
import { useNavigate, useParams } from "react-router-dom";
import UPLOADS_URL from "../../config/UPLOADS_URL";

function EditVariation() {
  const { id } = useParams();
  const [variation, setVariation] = useState([]);

  const navigate = useNavigate();

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
            .get(`${SERVER_URL}/product/get-variation/${id}`, {
              headers: { "x-access-token": token },
            })
            .then((variationResponse) => {
              if (variationResponse.status === 200) {
                const convertImageToBase64 = (imageUrl) => {
                  return fetch(imageUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                      return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = () => {
                          const base64data = reader.result;
                          resolve(base64data);
                        };
                        reader.onerror = reject;
                      });
                    });
                };

                const imagesArray = Object.values(
                  variationResponse.data.images
                ); // Convert object values to an array
                const imagePromises = imagesArray.map((imageUrl) =>
                  convertImageToBase64(`${UPLOADS_URL}/${imageUrl}`)
                );

                Promise.all(imagePromises)
                  .then((base64Images) => {
                    const updatedVariation = {
                      price: variationResponse.data.price || "",
                      stock: variationResponse.data.stock || "",

                      size: variationResponse.data.size || "",
                      color: variationResponse.data.color || "",
                      weight: variationResponse.data.weight || 0,
                      dimension: {
                        x: variationResponse.data.dimension.x || "",
                        y: variationResponse.data.dimension.y || "",
                        z: variationResponse.data.dimension.z || "",
                      },
                      offer_price: variationResponse.data.offer_price || "",
                      offer_start_date:
                        variationResponse.data.offer_start_date || "",
                      offer_end_date:
                        variationResponse.data.offer_end_date || "",
                      margin: variationResponse.data.margin || "",
                      images: base64Images,
                    };
                    setVariation(updatedVariation);
                  })
                  .catch((error) => {
                    console.error("Error:", error);
                  });
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
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVariation((prevVariation) => ({
      ...prevVariation,
      [name]: value,
    }));
  };
  const handleRemoveImage = (index) => {
    const updatedImages = variation.images.filter((_, i) => i !== index);
    setVariation((prevVariation) => ({
      ...prevVariation,
      images: updatedImages,
    }));
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageArray = variation.images ? [...variation.images] : []; // Check if variation.images is defined

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.readyState === FileReader.DONE) {
          // Check if the image already exists in the image array
          if (!imageArray.includes(reader.result)) {
            imageArray.push(reader.result);
            setVariation((prevVariation) => ({
              ...prevVariation,
              images: imageArray,
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("price", variation.price);
    formData.append("stock", variation.stock);
    formData.append("size", variation.size);
    formData.append("color", variation.color);
    formData.append("variationId", id);
    formData.append("weight", variation.weight);
    formData.append("dimension[x]", variation.dimension.x);
    formData.append("dimension[y]", variation.dimension.y);
    formData.append("dimension[z]", variation.dimension.z);
    formData.append("offer_price", variation.offer_price);
    formData.append("offer_start_date", variation.offer_start_date);
    formData.append("offer_end_date", variation.offer_end_date);
    formData.append("margin", variation.margin);
    if (variation?.images?.length !== 0) {
      for (let i = 0; i < variation?.images?.length; i++) {
        fetch(variation.images[i])
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `image_${i}.png`, {
              type: "image/png",
            });
            formData.append("images", file);

            // Check if all images have been appended before making the POST request
            if (i === variation.images.length - 1) {
              axios
                .post(`${SERVER_URL}/admin/update-variation`, formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    "x-access-token": localStorage.getItem("token"),
                  },
                })
                .then((res) => {
                  if (res.status === 200) {
                    setVariation({
                      stock: "",
                      size: "",
                      color: "",
                      weight: 0,
                      dimension: {
                        x: "",
                        y: "",
                        z: "",
                      },
                      offer_price: 0,
                      offer_start_date: "",
                      offer_end_date: "",
                      margin: "",
                    });

                    console.log("variation updated successfully");
                  }
                })
                .catch((err) => {
                  console.log(err.response.data);
                });
            }
          })
          .catch((error) => {
            console.error("Error fetching the image data:", error);
          });
      }
    }
  };

  return (
    <>
      <div className="main-wrapper">
        <SideBar />
        <div className="page-wrapper">
          <NavBar />
          <div className="page-content">
            <div className="row">
              <div className="col-md-6 grid-margin stretch-card">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Edit variation</h6>
                    <form className="forms-sample" onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="price" className="form-label">
                          Price
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="price"
                          autoComplete="off"
                          placeholder="price"
                          name="price"
                          value={variation.price}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="stock" className="form-label">
                          Stock
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="stock"
                          autoComplete="off"
                          placeholder="stock"
                          name="stock"
                          value={variation.stock}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="color" className="form-label">
                          Color
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="color"
                          autoComplete="off"
                          placeholder="color"
                          name="color"
                          value={variation.stock}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="size" className="form-label">
                          Size
                        </label>
                        <select
                          className="form-select"
                          id="size"
                          name="size"
                          value={variation.size}
                          onChange={handleChange}
                        >
                          <option value="L">L</option>
                          <option value="M">M</option>
                          <option value="S">S</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="weight" className="form-label">
                          Weight
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="weight"
                          autoComplete="off"
                          placeholder="weight"
                          name="weight"
                          value={variation.weight}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="offer_price" className="form-label">
                          Offer Price
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="offer_price"
                          autoComplete="off"
                          placeholder="offer_price"
                          name="offer_price"
                          value={variation.offer_price}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="offer_start_date"
                          className="form-label"
                        >
                          Offer Start Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="offer_start_date"
                          autoComplete="off"
                          placeholder="offer_start_date"
                          name="offer_start_date"
                          value={variation.offer_start_date}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="offer_end_date" className="form-label">
                          Offer End Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="offer_end_date"
                          autoComplete="off"
                          placeholder="offer_end_date"
                          name="offer_end_date"
                          value={variation.offer_end_date}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">variation Images</label>
                        <label className="custum-file-upload" htmlFor="file">
                          <div className="icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill=""
                              viewBox="0 0 24 24"
                            >
                              <g strokeWidth={0} id="SVGRepo_bgCarrier" />
                              <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                id="SVGRepo_tracerCarrier"
                              />
                              <g id="SVGRepo_iconCarrier">
                                <path
                                  fill=""
                                  d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                                  clipRule="evenodd"
                                  fillRule="evenodd"
                                />
                              </g>
                            </svg>
                          </div>
                          <div className="text">
                            <span>Click to upload image</span>
                          </div>
                        </label>
                        <input
                          type="file"
                          id="file"
                          multiple
                          onChange={handleImageChange}
                        />
                        {Array.isArray(variation.images) &&
                          variation.images.map((image, index) => (
                            <div
                              key={index}
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <img
                                src={image}
                                alt={`variation-${index}`}
                                style={{ width: "100px", height: "100px" }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                style={{ marginLeft: "10px" }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary me-2 m-2"
                      >
                        Submit
                      </button>
                      <button type="reset" className="btn btn-secondary">
                        Reset
                      </button>
                    </form>
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

export default EditVariation;
