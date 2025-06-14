'use client';

import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    name: 'Fashion',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl_huD1dS3bO83GAdLHIiSHfpejh0PtgHhPtcgdMukn-GLBYC-g6fqseVK-PBEsQZIok3VlpLeOVNqsYQC9hSkbdCFXlLxeOrtYwrpEeWdmk1WZYUFGjDbyScT5mhxf1HCcn3fbs64WFU321DSKPSLy_HVqDw1tQGuc70sLBo55_hvNNxEf339cx5VYcRPAJTwScM15HgkBS2jA9BA1YL_IWNk8fWhclYj57SVr20Mn53omOiHcV4z6NIObYk_9uuGq2ZEQSNCAs8'
  },
  {
    name: 'Home & Living',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpXcQv-uQq0uZWtrV7kQqq_Re36c45YjR5RQzNq71fvVfbX1-0zJG-XV3kzTsjgBlgVzPDtDEFRn24LOx-3PChEpFahaxvIGrpWnRe9eLZ6GD4urPkEzRYyyVNKrK1tgXwJDZS61xwBP5ZBJfgKuJu0li6visDTn1PW6LlTp_HFb42q2DeFK3ALXxPUkGcUwRHBCwG7UbKoetK6sAnPoDK0gWJhFyd7wBTMuMRZwJv6Ha1AFvfJCvq6j-TB8uHb5EiadyT16QqjO4'
  },
  {
    name: 'Electronics',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP2g6BVF8arf_f2mC3jVD6Pxkt-tkfccwyMs7Q0UvWBH3mWqyV8W4IepiFutIDxQmCM2Khy_9i5mpNh5q1hlwM7jzazqk3m1B8YIoaDtOF7XyUs8xjqWRjc_DIO7leri0TwFkihCE6Tzpzb7B1ipaWShqJo-Sz-imd8IWqlgCav12QFiljEgRBwu02NmvL3JnmV9pVG--S8Sk5lpnpjKENVM-3wQ57TOcU4GPNy23pKbN5KrPJvaQSprWrPmFooBn_QUwFGqGA13Q'
  },
  {
    name: 'Books',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPFgzbQIy572nRFjbiNExzgcb-ntBBnBSCB03qv4HuLsJKWNbdR4549tDCtFJ_nH7IMjszCqReA2jhOxW5GsW-YxvStFtt4_Ps3Lnde1qXPH34_3f8YhD9JJ261kZSWDUxURmBgGy02lmaxoBKblYKRl_1wvO2c9h86K6HrAHC43r69UGXEGJWfs7H20J8jxkknkTbm5RfFIzGCoNy5BQ0R0y9BIU5lI-2TWhVrf10tkyoYo4_IHJuhmwx_E4rVNrQpD8muqdPtxI'
  },
  {
    name: 'Sports & Outdoors',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvqhxTrLIDxAHJORSas9bXNcS0db3Lbi61Iptz9nTkEoMcbeIm4N-40tpSw-gLZEDwssNMjQJPBlHrLfTX9d30g5EEYG0eCOOk7jG1M0wJmMvhL4TZ2J7l2K43r6QKE5qU0LDbKEiDWmpczr_5gIyDwB-3sCLsf2Yz350VQQVkzcXvt8fvFxyYSAKrvPkSYtH1WtQGK4Wa_u72hwUncoiv9GAcYiX3ddw48mt3ztdjPKhWIlU3RgnlC5FVuMd1q9yJK9Ax2ghEDp8'
  },
  {
    name: 'Beauty & Personal Care',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOXevZMhzWvMnz91P2KakvbFMeTkqxk9sSNKneiZTryvR5kjv-5j4g3ti8-lEv_99lLxiyUBD3EvCDrvQ1kYwySYgraUGzJswLS-b63rJFHXka2xg1i4g-B461Ymwy5TXVCvJaRGEjQkiSifoHKldBd8RJPx87CRxTY4Xgs6PnNq_9-oNhpqEzAIyXVwSJZ0YuW2sGt9CNdvwBJF37dMOW82oaHLd3mxslm2IqC7HtPwztYHlk-sU8pvue29PfpsIhU5xASLu1pfQ'
  },
  {
    name: 'Toys & Games',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-r26BVdwHql5sk9IyQDSV712Po4rphiUoajTvoFATlt8tC4VwwddEk1a-Ebq6yxsFUuL20pycMOQLMaLAItiO-LPmM8H4wxNCtCSEr4rJUy9GtEQ1vJMMyEsHqTBDZiE2poX6RbkREX4yMTwV6SJx37UtPIQ1_b7Gk64pLWx_LpqOwIXNjH7Ie-NZ7j1o4p3K-v4n1OgM-SB2BXuB5JPRd49Np7zE57WlYodAKFDsxUawTrulpVrVvcTu70f_BxuvdcRYMVofTFU'
  },
  {
    name: 'Food & Grocery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm19IG8VfYvWL2gdanrUYYCFwaYIhq0yG9u-rnofcJ1mrel8pwI5YPAvSDZLvWIDkoEvgXJpo79LKkRmWyMH3LBZ6pPI3_DcGQ0hHJcQAIi1PghJQqrI7qCROdZJrUAfO0-8IPuYJYM7EcN-JUNKT1-mgjOThQBngm4qOEUs1sbWo5vAaMrKE3TYrNXoHKzZ-iL3fWadxOjvZZZaaGJfh6GjaDgDYxkByF6mvkfygC9JZA18IIIdfiVDwWxLb52m4BCCio4SKRhyg'
  }
];

const featuredCategories = [
  {
    name: 'Handmade Jewelry',
    description: 'Discover unique, handcrafted jewelry from independent designers.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlo0eDksOXtSKEfKY04z1Couy9c_fWpVvqERsKE7rjnPZjGirIErSkKsj-Qw2ZLSUAXyMgJtsAFuvV0V3Ruqk7eYraTLEeE52exR4wuvvju0MslberQ_CLROqgnUHPqKEyg78zse6tGT2oq7_dtPsyb39pgRes1haRhWvRjpVp-o0giHgXi-MumaeWGbEh7wbutDFeQ15Bqghf9GcUw2cVd1DoWrj32BLPy-SNNTst6EPZ_DoBctvQ67clLivfvLpf9dhiwIhHF2c'
  },
  {
    name: 'Vintage Clothing',
    description: 'Explore a curated collection of vintage clothing and accessories.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXE38xBIt9LVtmaCRXgX2pRYcWtvapVK1ryCQ_jurww62aGlutzJW_IACoEqfsNi9jlA-TyA5c-jYHODM4Govo_whm_j4pxDdQxodoVJPIaENcxhd-QPV1GQfKgvcHIcgrwmE4AtgyfltzDHqBEa11pj0VBROXg2-0BPzJw4ra5kNvN44WI7XRanvXWK_S-Anw3tlKH08tqLrHevNZXHX23vNcD9s4rEhck5xRCJMUeMAiXQmU38ytzRHOU31wJvwfPmefoV-URqU'
  },
  {
    name: 'Organic Skincare',
    description: 'Shop for natural and organic skincare products from small businesses.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrBEfWbUvLBSzKWy1lkgf2pWlbSItDNBKD_lfaNWhRPtl2qQ0bxtrMqotKY-rXrNr5hqhYd3_ITJ_KCnBuqwSB2-TMM8eXIb8AYw10sVN9VU4Py3rER7NlXouPW6zvDw0vF5mjQjp4_dgaz2bliwm5R1sEu8Xw6QYKcOqPQNaPfD6OPn93Dcea90wHHxr9o8EB14RyFZT6g2HBJmOtgXi1MZ1gPCIhrggJu1GOULhrqafgnUTqLVFVBbniSt7qWBrb0llHsA0d2h4'
  },
  {
    name: 'Artisanal Food',
    description: 'Find gourmet and artisanal food items from local producers.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcJv55IZ40TKrGXuMEKJjhUSIfUdE5raIJs5PK4mgOPwvgYYtO7dDYMtLv1se63FyykbkA22bv9Xhka0GVf3Z70yuDE4yVDUxR2-0oSGNrs1jfCArtY4F2eVZZLopldE8rRE1ElyUqB03X5hG6mRN3YbRGjg1TikbIWJiNhcF-wpPGGKDdQcZERl8JGS83HxzgBrZ_TrNPu0KHDvR-EOCA-q9vWUutSnCCsZTEPA1na9uQD6rR3buBQNsMuP9cJkIjfogKYNsDtM0'
  }
];

export default function CategoriesPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="px-4 py-3">
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-[#49739c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                </div>
                <input
                  placeholder="Search for categories"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49739c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                />
              </div>
            </label>
          </div>

          <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Categories</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
                className="flex flex-1 gap-3 rounded-lg border border-[#e7edf4] bg-white p-4 items-center hover:border-blue-400 transition-colors cursor-pointer"
              >
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10 shrink-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                </div>
                <h2 className="text-[#0d141c] text-base font-bold leading-tight">{category.name}</h2>
              </Link>
            ))}
          </div>

          <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Categories</h2>
          <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-stretch p-4 gap-3">
              {featuredCategories.map((category) => (
                <div key={category.name} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex flex-col">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={240}
                      height={240}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal">{category.name}</p>
                    <p className="text-[#49739c] text-sm font-normal leading-normal">{category.description}</p>
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