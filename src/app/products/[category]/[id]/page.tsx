'use client';

import { use, useState } from 'react';
import Link from 'next/link';

interface ProductDetailsProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export default function ProductDetails({ params }: ProductDetailsProps) {
  const { category, id } = use(params);

  // Mock product images for gallery
  const productImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBcDFQfWqOwA3hWH4q_LJvDj4Ja9iiBJry1Xl48Ww5X7j2uMxVAogVjRNkdZIekvMcDpxgLQzO8rVMD58eOVa7fmekP2huA-nlEMWkjaJVIukG0yxERkEVJ4u8a-P3vikVyTg7ndtLKDqb1W-18mC4KcmpVQUGS1hDxeeUJFAXKu9JtXyXqzRkH6MxVu3XVMa9a6aysrepDwhyjL6lG_diG6o5IuYnXzgoIj2_04kni1yhMQXPUGKfZRk4hCcy7H44ztURQwBfV798',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAF-_IwS2zjYwCsd3aIFCTKD-YlgUwQZkNhvay5t9eV18V0azJRb1vzB_7kBGeCzzAJuFlhcwrQm9XOz0dWD0MunRXDeP22jqb_j51UlCYdZQPtiqYphkFIr773p7sM6_9uSxSNymEAFdbvLCbLZ7EwVPHSUv9M7ydeP7oHw-EzzCjGyvBSrYnhYfOVuLMRVTJPHNM_-jU86RPvs1g2BHd8TbXrrK7k35yyFJ-YS2L9gE2BsVb9HY8f-ZKgy-aGJbBm92UBQU1-Fyc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAuqlEun_w-baTGvp1C4Q8BmufgQPZZDuUIKfBU_awwLRZ5CrmLl-iW-TI2bZ4PtMCy7IvznDVq4aF0HNW-948WewTTK5yh6QBXj_zLNa4YyyWJcB71-DfOVOU7m75OG4zW8Pf-NiAyvjtg1IH4rWjELRfgUf79Oi2zhvNgVtRC-7Wjyr1zADyukv4e5PAcA7OyFCIGQyeKRPSnmz9Zvl6bbmp5tXmluvEAxftV0GUw27gN2NUPRmaU4leh9-EY6Reos56hYpBZhv0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC8SuqeR7oyEJz1UF7tK6XR9fuMBqY0GTdzToptoShu2RDI2ODNlUYKLk-mKM7J-QoVPiTS6YA0ZgsTPcIdqRSmND_o4X2uIo3ZSc9Yu1Hjp8OLgzbSGyX-QT0vHudeDFiCXw4Xc4O6JWm4kKNUEVSGj4Z1V4aJmw3T58nS374VPReiuC2TIDNkYodu-bBVWFF7GaMo-UGW7GnzmpgHi18nHgFeoT2FMcDq26X68cTdhXOOjbTjpIWhpops2uOABe9LOWiKbGdVnk4'
  ];
  const [selectedImage, setSelectedImage] = useState(0);

  // Static product data for demo
  const product = {
    name: "Summer Breeze Dress",
    description:
      "A lightweight, flowy dress perfect for warm weather. Made from breathable cotton, it features a flattering silhouette and adjustable straps for a comfortable fit.",
    price: "$49.99",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      "rgb(240, 240, 240)",
      "rgb(224, 224, 224)",
      "rgb(208, 208, 208)"
    ],
    specifications: [
      { label: "Material", value: "100% Cotton" },
      { label: "Care Instructions", value: "Machine wash cold" },
      { label: "Fit", value: "Regular fit" },
      { label: "Length", value: "Above knee" }
    ],
    reviews: [
      {
        name: "Sophia Carter",
        date: "June 15, 2024",
        rating: 5,
        comment:
          "I absolutely love this dress! The fabric is so soft and comfortable, and the fit is perfect. I've received so many compliments on it.",
        likes: 5,
        dislikes: 1,
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAgfxDPKIIjK_8Euf9YHR55LMm6z2VzjALtj3-whZSH6adQySHu3F-S-MJLGr2PVFOCRt2LJLZWfd2afsWZwVOVOuksqm8nJ4W5p7XWKBt1ZlVGetz2BvI2P_4tErx8idFU-NX_spcMJb7JQEXE-aCTpiDSGylA7oz85tCalKvzzg8B_TTKjQ0Cmrtanf09QaCAZMYmIEodCDc9TrRDcwpb_XrrTimp7YE27Y1s3_WOgZOvLX9S9DNF3UYbfENDcx-O--sYEwDB4cQ"
      },
      {
        name: "Olivia Bennett",
        date: "May 20, 2024",
        rating: 4,
        comment:
          "This dress is great for summer. It's lightweight and easy to wear. The color is beautiful, and it fits true to size.",
        likes: 3,
        dislikes: 0,
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCdjYdnHFUnGDfgfMm0-9ZxWJ_LPyAArMO5M0gp85IV76kKEff5Pk3dwI7twyUYRfgvPZGfLv1LsJSod9s-fRsuTAypOAI2N-D2kSGWvlHlDEIq0zWwfeDYt2IEC_lVAnaQxqcb-AFhsTOhw10s4OEeoIOErn1Nw4IFvQ9FpY-wFXKzQbE5olI0tPSMmNBboSDEPA-pyMEepFnFQnDeI3RCIEoYAcbA6ihP2P7Wr2dLhwVFIoRahGoH1kuWDhu0Z1x-38HKWcTi6F0"
      }
    ],
    related: [
      {
        name: "Floral Sundress",
        price: "$39.99",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAF-_IwS2zjYwCsd3aIFCTKD-YlgUwQZkNhvay5t9eV18V0azJRb1vzB_7kBGeCzzAJuFlhcwrQm9XOz0dWD0MunRXDeP22jqb_j51UlCYdZQPtiqYphkFIr773p7sM6_9uSxSNymEAFdbvLCbLZ7EwVPHSUv9M7ydeP7oHw-EzzCjGyvBSrYnhYfOVuLMRVTJPHNM_-jU86RPvs1g2BHd8TbXrrK7k35yyFJ-YS2L9gE2BsVb9HY8f-ZKgy-aGJbBm92UBQU1-Fyc"
      },
      {
        name: "Boho Maxi Dress",
        price: "$59.99",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAuqlEun_w-baTGvp1C4Q8BmufgQPZZDuUIKfBU_awwLRZ5CrmLl-iW-TI2bZ4PtMCy7IvznDVq4aF0HNW-948WewTTK5yh6QBXj_zLNa4YyyWJcB71-DfOVOU7m75OG4zW8Pf-NiAyvjtg1IH4rWjELRfgUf79Oi2zhvNgVtRC-7Wjyr1zADyukv4e5PAcA7OyFCIGQyeKRPSnmz9Zvl6bbmp5tXmluvEAxftV0GUw27gN2NUPRmaU4leh9-EY6Reos56hYpBZhv0"
      },
      {
        name: "Casual Shift Dress",
        price: "$44.99",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC8SuqeR7oyEJz1UF7tK6XR9fuMBqY0GTdzToptoShu2RDI2ODNlUYKLk-mKM7J-QoVPiTS6YA0ZgsTPcIdqRSmND_o4X2uIo3ZSc9Yu1Hjp8OLgzbSGyX-QT0vHudeDFiCXw4Xc4O6JWm4kKNUEVSGj4Z1V4aJmw3T58nS374VPReiuC2TIDNkYodu-bBVWFF7GaMo-UGW7GnzmpgHi18nHgFeoT2FMcDq26X68cTdhXOOjbTjpIWhpops2uOABe9LOWiKbGdVnk4"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content (no header/navbar here) */}
      <div className="gap-1 px-6 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap gap-2 p-4">
            <Link className="text-[#6a7581] text-base font-medium leading-normal" href="#">Home</Link>
            <span className="text-[#6a7581] text-base font-medium leading-normal">/</span>
            <Link className="text-[#6a7581] text-base font-medium leading-normal" href="#">{category.charAt(0).toUpperCase() + category.slice(1)}</Link>
            <span className="text-[#6a7581] text-base font-medium leading-normal">/</span>
            <span className="text-[#121416] text-base font-medium leading-normal">{product.name}</span>
          </div>

          {/* Main Section: Gallery + Info */}
          <div className="flex w-full grow bg-white @container p-4 gap-8">
            {/* Image Gallery */}
            <div className="flex flex-col gap-3 min-w-[320px] max-w-[360px]">
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img src={productImages[selectedImage]} alt="Product main" className="object-cover w-full h-full" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={img}
                    className={`aspect-square rounded-xl border-2 ${selectedImage === idx ? 'border-[#528bc5]' : 'border-[#dde0e3]'} overflow-hidden focus:outline-none`}
                    onClick={() => setSelectedImage(idx)}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <img src={img} alt="Product thumbnail" className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Panel */}
            <div className="flex-1 flex flex-col w-[360px]">
              <h1 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">{product.name}</h1>
              <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1">{product.description}</p>
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Price</h3>
              <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1">{product.price}</p>
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Size</h3>
              <div className="flex flex-wrap gap-3 pb-2">
                {product.sizes.map((size) => (
                  <label key={size} className="text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#dde0e3] px-4 h-11 text-[#121416] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#528bc5] relative cursor-pointer">
                    {size}
                    <input type="radio" className="invisible absolute" name="size" />
                  </label>
                ))}
              </div>
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Color</h3>
              <div className="flex flex-wrap gap-5 pb-2">
                {product.colors.map((color, index) => (
                  <label key={color} className="size-10 rounded-full border border-[#dde0e3] ring-[color-mix(in_srgb,#121416_50%,_transparent)] has-[:checked]:border-[3px] has-[:checked]:border-white has-[:checked]:ring" style={{ backgroundColor: color }}>
                    <input type="radio" className="invisible" name="color" defaultChecked={index === 0} />
                  </label>
                ))}
              </div>
              <div className="flex justify-stretch">
                <div className="flex flex-1 gap-3 flex-wrap py-3 justify-start">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#528bc5] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Buy Now</span>
                  </button>
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f1f2f4] text-[#121416] text-sm font-bold leading-normal tracking-[0.015em]">
                    <span className="truncate">Add to Cart</span>
                  </button>
                </div>
              </div>
              <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Specifications</h3>
              <div className="grid grid-cols-[20%_1fr] gap-x-6">
                {product.specifications.map((spec) => (
                  <div key={spec.label} className="col-span-2 grid grid-cols-subgrid border-t border-t-[#dde0e3] py-5">
                    <p className="text-[#6a7581] text-sm font-normal leading-normal">{spec.label}</p>
                    <p className="text-[#121416] text-sm font-normal leading-normal">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Customer Reviews</h3>
          <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
            <div className="flex flex-col gap-2">
              <p className="text-[#121416] text-4xl font-black leading-tight tracking-[-0.033em]">4.5</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="text-[#121416]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-[#121416] text-base font-normal leading-normal">120 reviews</p>
            </div>
            <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="contents">
                  <p className="text-[#121416] text-sm font-normal leading-normal">{rating}</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dde0e3]">
                    <div className="rounded-full bg-[#121416]" style={{ width: `${rating * 20}%` }} />
                  </div>
                  <p className="text-[#6a7581] text-sm font-normal leading-normal text-right">{rating * 20}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="flex flex-col gap-8 overflow-x-hidden bg-white p-4">
            {product.reviews.map((review, index) => (
              <div key={index} className="flex flex-col gap-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url('${review.avatar}')` }} />
                  <div className="flex-1">
                    <p className="text-[#121416] text-base font-medium leading-normal">{review.name}</p>
                    <p className="text-[#6a7581] text-sm font-normal leading-normal">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={i < review.rating ? "text-[#121416]" : "text-[#bec4cb]"}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-[#121416] text-base font-normal leading-normal">{review.comment}</p>
                <div className="flex gap-9 text-[#6a7581]">
                  <button className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z" /></svg>
                    <p className="text-inherit">{review.likes}</p>
                  </button>
                  <button className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z" /></svg>
                    <p className="text-inherit">{review.dislikes}</p>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Related Products */}
          <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Related Products</h3>
          <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-stretch p-4 gap-3">
              {product.related.map((related, index) => (
                <div key={index} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
                  <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl flex flex-col" style={{ backgroundImage: `url('${related.image}')` }} />
                  <div>
                    <p className="text-[#121416] text-base font-medium leading-normal">{related.name}</p>
                    <p className="text-[#6a7581] text-sm font-normal leading-normal">{related.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 