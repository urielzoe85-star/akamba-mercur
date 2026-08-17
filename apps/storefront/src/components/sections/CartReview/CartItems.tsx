import { HttpTypes } from '@medusajs/types';

import { CartItemsHeader, CartItemsProducts } from '@/components/cells';
import { BRAND } from '@/config/brand';

export const CartItems = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  if (!cart) return null;

  const groupedItems: any = groupItemsBySeller(cart);

  return Object.keys(groupedItems).map(key => (
    <div
      key={key}
      className="mb-4"
    >
      <CartItemsHeader seller={groupedItems[key]?.seller} />
      <CartItemsProducts
        delete_item={false}
        change_quantity={false}
        products={groupedItems[key].items || []}
        currency_code={cart.currency_code}
      />
    </div>
  ));
};

function groupItemsBySeller(cart: HttpTypes.StoreCart) {
  const groupedBySeller: any = {};

  cart.items?.forEach((item: any) => {
    const seller = item.offer?.seller;
    if (seller) {
      if (!groupedBySeller[seller.id]) {
        groupedBySeller[seller.id] = {
          seller: { ...seller, photo: seller.photo ?? seller.logo },
          items: []
        };
      }
      groupedBySeller[seller.id].items.push(item);
    } else {
      if (!groupedBySeller['akamba']) {
        groupedBySeller['akamba'] = {
          seller: {
            name: BRAND.name,
            id: 'akamba',
            photo: BRAND.logo,
            created_at: new Date()
          },
          items: []
        };
      }
      groupedBySeller['akamba'].items.push(item);
    }
  });

  return groupedBySeller;
}
