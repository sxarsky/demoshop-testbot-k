import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "@/styles/select-zindex-workaround.css";
import { useNavigate } from "react-router-dom";

interface Product {
  name: string;
  description: string;
  image_url: string;
  category: string;
  in_stock: boolean | null;
  price: string;
}

const AddProductForm: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    image_url: "",
    category: "",
    in_stock: null,
    price: "",
  });

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...product,
      in_stock: product.in_stock === true,
      price: parseFloat(product.price),
    };

    try {
      const res = await fetch("https://demoshop.skyramp.dev/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to create product:", await res.text());
      } else {
        const data = await res.json();
        if (data && data.product_id) {
          window.location.href = `/products/${data.product_id}`;
        } else {
          console.log("Product created, but no ID returned:", data);
        }
        // Reset form if needed
      }
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative max-w-md bg-white p-6 rounded-lg shadow mx-auto w-full">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl font-bold z-10 bg-white rounded-full px-2 py-0.5 shadow"
          style={{ zIndex: 10, background: "white" }}
          onClick={() => {
            if (typeof window !== "undefined" && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent("closeAddProductModal"));
            }
          }}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h3 className="text-2xl font-semibold text-center mb-6">
          Add new product
        </h3>

        <form
          className="flex flex-col"
          style={{ gap: "1rem" }}
          onSubmit={handleSubmit}
        >
          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Product Name
            </label>
            <Input
              name="name"
              placeholder="e.g. Apple Macbook Pro"
              value={product.name}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="What does your product do?"
              value={product.description}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Image URL
            </label>
            <Input
              name="image_url"
              placeholder="e.g. https://images.google.com"
              value={product.image_url}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Category
            </label>
            <Input
              name="category"
              placeholder="e.g. Computers, Toys"
              value={product.category}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
            />
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              In stock?
            </label>
            <Select
              value={
                product.in_stock === null
                  ? ""
                  : product.in_stock
                  ? "yes"
                  : "no"
              }
              onValueChange={(value) =>
                setProduct((prev) => ({
                  ...prev,
                  in_stock:
                    value === "yes"
                      ? true
                      : value === "no"
                      ? false
                      : null,
                }))
              }
            >
              <SelectTrigger className="w-full min-w-[280px] max-w-full px-4 py-2">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Price
            </label>
            <Input
              name="price"
              placeholder="e.g. 2499.99"
              type="number"
              value={product.price}
              onChange={handleChange}
              className="w-full min-w-[280px] max-w-full px-4 py-2"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800 mt-2"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
