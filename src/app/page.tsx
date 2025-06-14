"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1">
          <div className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="px-4 py-3">
                <form onSubmit={handleSearch} className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div
                      className="text-[#49739c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0"
                      data-icon="MagnifyingGlass"
                      data-size="24px"
                      data-weight="regular"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                        ></path>
                      </svg>
                    </div>
                    <input
                      placeholder="Search for products, brands, and more"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49739c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <section className="category-banners mb-8">
                <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex items-stretch p-4 gap-3">
                    <Link href="/category/kitchen" className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 hover:shadow-md transition-shadow">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
                        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3DHOiBjHLKZt-o7jb_QtFzfJ6IYrpjVIiQpITGH1sT-ZQln15vLM2DBQFRxztqXZFelK1MnxkPRfRyFdqZENlMseoIWZdie8QaxEcdgvUG95-ezmUR4YWbRTMzPU_tPaxD50-p3kJYY_aZk4xadZgUEGOblaRsuV4YU9SnxJ1Z5pW9zhUKHB_2FbttGxSljuDEhmj48Yu3ZyBMpbP0c5ip5SnJs_RMD-VESvZU7s1jMKn6ytRHtgusnWV7JkXYsLmcoZ7W_trLkU")'}}
                      ></div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal">Upgrade Your Kitchen</p>
                    </Link>
                    <Link href="/category/fashion" className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 hover:shadow-md transition-shadow">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
                        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBS6dZ3pvco8yz1TZDpOG-LTAJzWb3VVy3uDCmoNhyhsesVJbLxEGyfQc11QHyndJry9dzWEtuEJYje08HjgQ_g988y0lHUchUBZ6TPY7yJSrap6-Mx_aY0GULmz9f770e1hcLDjcsbyu8pup5RSM7nc9CXn1uPlSQ6WWEgKv_IBq_-ax2R98d-QU-TFGKi2Dhzrke2aDf0Iw9ZXyXHHCEzw7w0lmik33NbSmahUqi5KUQMGy1D1rsrE-lleLmft4hImYZkQZ_o52I")'}}
                      ></div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal">Fashion Forward</p>
                    </Link>
                    <Link href="/category/tech" className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 hover:shadow-md transition-shadow">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
                        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuChlg2Mim5iTkF9z8AaaAAC2-06zBmb4HGHFrD5Z4Bhayn8eT4ci1S-B0B16CfJMX05sIKjbVRL7J5lIAV2jSNsyaF7GhS9_dWlvwcrtVojRRea19pig2ygfBa9oOtP5G1KDcJPOjZpX9VrLT2MQpZAZiet6CBb6EVy0DgKPoKnGnMHMqbjRgGjohL5Ty9xuHGNtYNrjlMbuJ-l_kGq3TholeRJBX_zKTW8nP0fsnLiJ2_ozdke6ZycwCsoc4_ijeIPdH2OrMmOBDQ")'}}
                      ></div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal">Tech Trends</p>
                    </Link>
                    <Link href="/category/home" className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 hover:shadow-md transition-shadow">
                      <div
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
                        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCrHGmVHjKXfsRB4SgdNdI3kXRflDssw3BOkM78KiwGgKvTRTTyXjG2AWb-VyDba1efw2Dl1uBfgOfYZwIGd_7zaaNmWWO2sYy5sgRyXpB0Re9k3bdIkac1o3mhL8EwqM_EfGF918Cm7i-uemSmnPCmcg3AKIovEqTzWZFxqKYdGMgZ1kXiL-VBlz0_b-ZafZcEFf3irriisSs-DK7PU668bnDoWuRnQaNeOlT9c3XBtHlOU_Cr65IG0iV9Cu5ckEp0EhRnWS17_GN88")'}}
                      ></div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal">Decorate Your Home</p>
                    </Link>
                  </div>
                </div>
              </section>

              <section className="featured-products mb-8">
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Products</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                  <Link href="/product/smart-watch" className="flex flex-col gap-3 pb-3 group cursor-pointer hover:shadow-md transition-all rounded-lg p-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                      style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDsxvTrrvArtJFhC3K1rvLvZaMWH6PA5yL2A0wqOmppyOSUkjkkDE5qmT3_B_0B_0SC5ubr5oYZ-NA4ck_58BDv8eCtUQwf5tI2TtsJVmb7wxOEBjB15C8U58kLArUNkIheRhNKseubLGRpGp77Ohx9i70QghTqDigjaarQxnA_38a_mCqXekL9KdoylVEZ_JhxClLlWmnxl_9sISr6_Ehwj1Ye9S0JzRJr_28OCPL3ylID9GwS2-LubWU3MZAfyQpKZ0IFtJuQwyU")'}}
                    ></div>
                    <div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal group-hover:text-blue-600 transition-colors">Smart Watch</p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">Stay connected in style</p>
                    </div>
                  </Link>
                  
                  <Link href="/product/wireless-headphones" className="flex flex-col gap-3 pb-3 group cursor-pointer hover:shadow-md transition-all rounded-lg p-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                      style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCnrrWa4KCDu1oJBzrKMjjG17DzG3xgrFMDQmFmxiLjlgYAkP4DrKwFPzjZivw_loSPuhVujN89p3hG6ifcMCO__fkRCLjkfLq20kz4POxDTCUzPMHivJlBplJt4ktvqHKRA9O8CvSZxZSWj9hOKGnnby_NfYNZ4uumQnUnxkpZvj2bbJJdpiuGbTqBfASqVltR0bCTDSmWOv1cB1VQLfF4tTGrTxLq_KoTmCyoz4lrYAGqou7vbA5y5xpvwdsHwjsKkbXbKWcS5eo")'}}
                    ></div>
                    <div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal group-hover:text-blue-600 transition-colors">Wireless Headphones</p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">Immersive sound experience</p>
                    </div>
                  </Link>
                  
                  <Link href="/product/leather-handbag" className="flex flex-col gap-3 pb-3 group cursor-pointer hover:shadow-md transition-all rounded-lg p-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                      style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9OLWsQz9Hb9BW9iEx8TWZDfO-CTxMuT5UKcDuTxJin0jNwhtnbzSLMrLJCfMPwlb5PXnp8Eq6XjwX_sBilUin8O11r8u12fd1n38_N7eq-t96_klNTsUhEBSJyVDxhOyKFFI6OsbNxPHLbt0IC-rUEDFORIkOEOVhF_CrCHDFGg07pkcHRHITMN-lpFwLwMpYA5tKTbomewL3HczjNcHQxQHjpTlUWJVYFyImeaZU2v4kM75lVogozXtRjGTroOduqa1ZxRYEA3c")'}}
                    ></div>
                    <div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal group-hover:text-blue-600 transition-colors">Leather Handbag</p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">Elegant and spacious</p>
                    </div>
                  </Link>
                  
                  <Link href="/product/running-shoes" className="flex flex-col gap-3 pb-3 group cursor-pointer hover:shadow-md transition-all rounded-lg p-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                      style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5ZmRDNKyOSYfQwkAxbDTfhFpcTdVjkiWvI8Rth1vFTaN1BPNdT57NZ6FuLrWqFtqxabdmYvgUTmdT23yV-KNQICi7gijGLEz8qxJcfrZP1PHQ1ECaH3LahptsL62IMASLerOVK67enyeQvPA2oTEu9fB25NdBNMKtUfOIGBhdjOPhMxuT4FyGeE4FSUJ4pKp4-qy67xJNomzW45KyK2ESMEgAkn4-XP-MFAljNbHZPcljzRsal_XGJoWsg7tZTj6DiV6ECK0aDnA")'}}
                    ></div>
                    <div>
                      <p className="text-[#0d141c] text-base font-medium leading-normal group-hover:text-blue-600 transition-colors">Running Shoes</p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">Comfort and performance</p>
                    </div>
                  </Link>
                </div>
              </section>

              <section className="top-categories">
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Top Categories</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
                  <Link href="/category/electronics" className="flex flex-col gap-3 pb-3 group cursor-pointer hover:shadow-md transition-all rounded-lg p-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                      style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC10JIZ4Lq6592OOVhgEVVwX5G_n_xDsVT9mCmvagXYGDJmJxzY_IISHghtnMKsrzjm1mXYNgZXPf9C4SZnHq--S8_BHwVL-P-twAwkIXtCJt2dFXbCeU33PTEMC3VMYPA-Q8G3AJ3s496nccWuQHHxxCv5ZjlkV0g05teufUs_J_45BxwgYWT3jrNLCrOpDNJeHIIIfWlGyqZKxF0rVTyIATf2K4Xw3udVgXsakVkfUt1f2XwieUNEfW4ll2JzfjY0MwMkCgqdIZ4")'}}
                    ></div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal group-hover:text-blue-600 transition-colors">Electronics</p>
                  </Link>
                  
                  <Link href="/category/fashion" className="flex flex-col gap-3 pb-3 group cursor-pointer hover:shadow-md transition-all rounded-lg p-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                      style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBCbXXl0RyGeZ18lveDjSFVxYjtkdbuH_wktEWd7L6EbznWe7pPAVfmqjqRP2ZFXdTvL9vH3Yfc6jEOaBcoiNs-7IpmuZN_JN4ZKWLetpNqo7gjUhN7REb05opFadPckY8yA1qguH4v5hx2OvPJJ8FZpBcC35KPG9g9tiNbUz0gJxtWcp2-Z4bg5yY8l7JeWQvqwsBDcZc5waHazI4rb4sKyqgYTy_jXIbWuqW0Tgb_RdvyGN_mgH7IYHioecqy9U2qUJJCLwux7AQ")'}}
                    ></div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal group-hover:text-blue-600 transition-colors">Fashion</p>
                  </Link>
                  
                  <Link href="/category/home-kitchen" className="flex flex-col gap-3 pb-3 group cursor-pointer hover:shadow-md transition-all rounded-lg p-2">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                      style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsIcNyI_DmMvaGSuM298RT3mS-VvQuQ2w6FP3da0bQpAlevotafsda1Orb60Cr7YmwXg594hdIHFwYT_C9Kj9F72VhTn0zplmeML1hDOs-JwSJb7Jmd2a_gmQBgJbtjKRkUzqMxjeq9RfmF6HzZ3Z2bj6_cAG_n5r0CoZ3mF9iPvx-4MVXV4rQB6zmT3doc-0gz6yF0jeSMtixaTu-zjiGPU4AkmXR8TmzbDvBXSdiuOpasVrLgFdQA5LV9ot7beoUnvL6eEvuZ9g")'}}
                    ></div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal group-hover:text-blue-600 transition-colors">Home &amp; Kitchen</p>
                  </Link>
                </div>
              </section>
            </div>
        </div>
      </main>
        <footer className="flex justify-center bg-white border-t border-[#e7edf4] mt-10">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
              <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                <Link className="text-[#49739c] text-base font-normal leading-normal min-w-40 hover:text-blue-600 transition-colors" href="/customer-service">Customer Service</Link>
                <Link className="text-[#49739c] text-base font-normal leading-normal min-w-40 hover:text-blue-600 transition-colors" href="/about">About Us</Link>
                <Link className="text-[#49739c] text-base font-normal leading-normal min-w-40 hover:text-blue-600 transition-colors" href="/terms">Terms of Service</Link>
                <Link className="text-[#49739c] text-base font-normal leading-normal min-w-40 hover:text-blue-600 transition-colors" href="/privacy">Privacy Policy</Link>
              </div>
              <p className="text-[#49739c] text-base font-normal leading-normal">@2024 Marketplace. All rights reserved.</p>
            </footer>
          </div>
      </footer>
      </div>
    </div>
  );
}
