import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css'; // استيراد ملف الـ CSS الخاص بتنسيق الويب
import toast, { Toaster } from 'react-hot-toast';
import { ReactComponent as YourSvg } from './wh.svg';
// رابط ملف الـ CSV
const CSV_URL ='https://docs.google.com/spreadsheets/d/e/2PACX-1vRtpueXiDAlpq_feLs57C1qlIEa8w8DuzuIFOJ8NvrOn3_MRYPY0bkeTKzArirdeOyrravqAwd9NW5v/pub?gid=1279445680&single=true&output=csv';

export default function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartVisible, setIsCartVisible] = useState(false);

  // رقم الواتساب الخاص بك (مع الكود الدولي بدون +)
  const WHATSAPP_PHONE = '201018526001';

  useEffect(() => {
    fetchProductsFromCSV();
  }, []);

  // دالة البحث والفلترة
  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((item) =>
        item.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const fetchProductsFromCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch(CSV_URL);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
			console.log(results.data);
          const loadedProducts = results.data
		  
            .map((row, index) => {
             if (row.title || row.price) {
                return {
                  id: String(index + 1),
                  title: String(row.name ||'').trim(),
                  price: String(row.price ||'').trim(),
                };
              }
              return null;
            })
            .filter((item) => item !== null);

          setProducts(loadedProducts);
          setFilteredProducts(loadedProducts);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          window.alert('فشل في قراءة بيانات ملف الـ CSV');
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Error fetching CSV:', error);
      window.alert('تعذر تحميل قائمة المنتجات من الرابط');
      setLoading(false);
    }
  };

  // إضافة منتج للسلة
  const addToCart = (product) => {
	  
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
		toast.success('Successfully add!');
      const updatedCart = [...cart];
      updatedCart[existingIndex].qty += 1;
      setCart(updatedCart);
	  toast.success(`تم زيادة كمية ${product.title} في السلة!`);
	 
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
	  toast.success(`تمت إضافة المنتج  ${product.title} لسلة بنجاح!`);
    }
  };

  const increaseQty = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].qty += 1;
    setCart(updatedCart);
  };

  const decreaseQty = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].qty > 1) {
      updatedCart[index].qty -= 1;
      setCart(updatedCart);
    } else {
      removeFromCart(index);
    }
  };

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
	toast.error('تم حذف المنتح!');
  };

  const checkoutWhatsApp = () => {
    if (cart.length === 0) {
      window.alert('سلة الشراء فارغة!');
      return;
    }

    let message = 'مرحباً، أرجو طلب المنتجات التالية:%0A';
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.title} (السعر: ${item.price}) - (الكمية: ${item.qty})%0A`;
    });

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;
    window.open(url, '_blank');
	setCart([]);
	toast.success('تم الارسال بنجاح ');
	toast.success('تم افراغ السلة');
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="container" dir="rtl">
      {/* الهيدر العلوي */}
      <header className="header">
        <h1 className="headerTitle">🦷 Dento Material</h1>
        <button className="cartButton" onClick={() => setIsCartVisible(true)}>
          🛒 السلة ({totalItemsCount})
        </button>
      </header>

      {/* صندوق البحث */}
      {!loading && (
        <div className="searchContainer">
          <input
            type="text"
            className="searchInput"
            placeholder="ابحث عن اسم المنتج..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      )}
<Toaster/>
      {/* مؤشر التحميل أثناء جلب البيانات */}
      {loading ? (
        <div className="loadingContainer">
          <div className="spinner"></div>
          <p className="loadingText">جاري تحميل قائمة المنتجات...</p>
        </div>
      ) : (
        /* عرض شبكة المنتجات */
        <div className="productList">
          {filteredProducts.length === 0 ? (
            <p className="emptySearchText">لا توجد نتائج مطابقة لبحثك</p>
          ) : (
            <div className="gridContainer">
              {filteredProducts.map((item) => (
                <div key={item.id} className="productCard">
                  <div className="productInfo">
                    <h3 className="productTitle">{item.title}</h3>
                    <p className="productPrice">{item.price}</p>
                    <button className="addButton" onClick={() => addToCart(item)}>
                      أضف إلى السلة 🛒
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
<a
      href={`https://wa.me/${WHATSAPP_PHONE }?text=${encodeURIComponent('اريد الاستفسار عن')}`}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
    >
      {/* يمكنك استخدام أيقونة FontAwesome أو SVG أو صورة */}
     <YourSvg/>
    </a>
      {/* نافذة سلة الشراء (Modal) */}
      {isCartVisible && (
        <div className="modalOverlay" onClick={() => setIsCartVisible(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2 className="modalTitle">سلة المنتجات المختارة</h2>
              <button className="closeButton" onClick={() => setIsCartVisible(false)}>
                ✕
              </button>
            </div>

            <div className="cartItemsContainer">
              {cart.length === 0 ? (
                <p className="emptyText">السلة فارغة حالياً</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cartItemRow">
                    <div style={{ flex: 1, marginLeft: '10px' }}>
                      <h4 className="cartItemTitle">{item.title}</h4>
                      <p className="cartItemPrice">{item.price}</p>
                    </div>

                    <div className="qtyContainer">
                      <button className="qtyBtn" onClick={() => decreaseQty(index)}>
                        -
                      </button>
                      <span className="qtyText">{item.qty}</span>
                      <button className="qtyBtn" onClick={() => increaseQty(index)}>
                        +
                      </button>
                    </div>

                    <button className="deleteButton" onClick={() => removeFromCart(index)}>
                      حذف
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <button className="whatsappCheckoutButton" onClick={checkoutWhatsApp}>
                💬 إتمام الطلب عبر الواتساب
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}