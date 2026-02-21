import React from 'react';
import { ShoppingBag } from 'lucide-react';
import classNames from 'classnames';

interface Product {
    id: string;
    name: string;
    price: string;
    image: string; // Placeholder color or icon
    tag?: string;
}

export const Jieyuan: React.FC = () => {
    const products: Product[] = [
        { id: '1', name: '小叶紫檀佛珠', price: '¥ 199', image: 'bg-amber-800', tag: '热销' },
        { id: '2', name: '沉香线香', price: '¥ 68', image: 'bg-stone-400' },
        { id: '3', name: '金刚经手抄本', price: '¥ 39', image: 'bg-amber-100', tag: '精选' },
        { id: '4', name: '莲花烛台', price: '¥ 128', image: 'bg-red-400' },
        { id: '5', name: '禅茶一味', price: '¥ 88', image: 'bg-green-700' },
        { id: '6', name: '更衣香囊', price: '¥ 29', image: 'bg-purple-300' },
    ];

    const handleBuy = (product: Product) => {
        alert(`【${product.name}】\n功能开发中，敬请期待结缘！`);
    };

    return (
        <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-5 bg-white shadow-sm z-10">
                <h1 className="text-xl font-serif font-bold text-gray-800">结缘法物</h1>
                <p className="text-xs text-gray-400 mt-1">广结善缘，不仅是物，更是心意。</p>
            </header>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="grid grid-cols-2 gap-4">
                    {products.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleBuy(item)}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer active:scale-95 transition-transform"
                        >
                            {/* Image Placeholder */}
                            <div className={classNames("h-32 w-full relative flex items-center justify-center", item.image)}>
                                <ShoppingBag className="text-white/50" size={32} />
                                {item.tag && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                                        {item.tag}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-amber-600 font-bold text-sm">{item.price}</span>
                                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <ShoppingBag size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-300 mb-2">— 更多法物 正在筹备 —</p>
                </div>
            </div>
        </div>
    );
};
