const initState = {
  product: "",
  selectedColorCode: "",
  selectedSize: "",
  quantity: 1

}

function reducer (state, action) {
  switch(action.type){
    case 'fetchData' :
      return {
          ...state,
          selectedColorCode: action.payload.colorCode,
          product: action.payload.product,
      }
    case 'resetSelectedColor' :
      return {
        ...state,
        selectedColorCode: action.payload.colorCode,
        selectedSize: action.payload.size,
        quantity: action.payload.quantity
      }
    case 'selectedSize' :
      return {
          ...state,
          selectedSize: action.payload.size,
      }
      case 'quantity' :
        return {
            ...state,
            quantity: action.payload.quantity,
        }
      
        default:
          return state
  }

}

function Product(props) {
  const [state, dispatch] = React.useReducer(reducer, initState)
  // const [product, setProduct] = React.useState();
  // const [selectedColorCode, setSelectedColorCode] = React.useState();
  // const [selectedSize, setSelectedSize] = React.useState();
  // const [quantity, setQuantity] = React.useState(1);
  React.useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    api.getProduct(id).then((json) => {
      dispatch({ type: 'fetchData',
      payload: { 
        colorCode: json.data.colors[0].code, 
        product:  json.data} })
      // setSelectedColorCode(json.data.colors[0].code);
      // setProduct(json.data);
    });
  }, []);
  
  if (!state.product) return null;

  function getStock(colorCode, size) {
    return state.product.variants.find(
      (variant) => variant.color_code === colorCode && variant.size === size
    ).stock;
  }

  function RenderProductColorSelector() {
    return (
      <div className="product__color-selector">
        {state.product.colors.map((color) => (
          <div
            key={color.code}
            className={`product__color${
              color.code === state.selectedColorCode
                ? ' product__color--selected'
                : ''
            }`}
            style={{ backgroundColor: `#${color.code}` }}
            onClick={() => {
              dispatch( { type: 'resetSelectedColor', payload: { colorCode:color.code, size: "", quantity: 1} } )
              // setSelectedColorCode(color.code)
              // setSelectedSize();
              // setQuantity(1);
            }}
          />
        ))}
      </div>
    );
  }

  function renderProductSizeSelector() {
    return (
      <div className="product__size-selector">
        {state.product.sizes.map((size) => {
          const stock = getStock(state.selectedColorCode, size);
          return (
            <div
              key={size}
              className={`product__size${
                size === state.selectedSize ? ' product__size--selected' : ''
              }${stock === 0 ? ' product__size--disabled' : ''}`}
              onClick={() => {
                if (stock === 0) return;
                dispatch({ type: 'selectedSize', payload: {size}})
                // setSelectedSize(size);
                if (stock < state.quantity)  
                dispatch( { type: 'quantity', payload: {quantity: 1} } )//setQuantity(1);
                //設定換尺寸如果庫存小於原數量要回覆1
              }}
            >
              {size}
            </div>
          );
        })}
      </div>
    );
  }

  function renderProductQuantitySelector() {
    return (
      <div className="product__quantity-selector">
        <div
          className="product__quantity-minus"
          onClick={() => {
            if (!state.selectedSize) return;
            if (state.quantity === 1) return;
            dispatch( { type: 'quantity', payload: {quantity:state.quantity  - 1 }} )
            // setQuantity(quantity - 1);
          }}
        />
        <div className="product__quantity-value">{state.quantity}</div>
        <div
          className="product__quantity-add"
          onClick={() => {
            if (!state.selectedSize) return;
            const stock = getStock(state.selectedColorCode, state.selectedSize);
            if (state.quantity === stock) return;
            dispatch( { type: 'quantity', payload:  {quantity:state.quantity  + 1}} )
            //setQuantity(quantity + 1);
          }}
        />
      </div>
    );
  }

  function addToCart() {
    if (!state.selectedSize) {
      window.alert('請選擇尺寸');
      return;
    }
    const newCartItems = [
      ...props.cartItems,
      {
        color: state.product.colors.find((color) => color.code === state.selectedColorCode),
        id: state.product.id,
        image: state.product.main_image,
        name: state.product.title,
        price: state.product.price,
        qty: state.quantity,
        size: state.selectedSize,
        stock: getStock(state.selectedColorCode, state.selectedSize),
      },
    ];
    window.localStorage.setItem('cart', JSON.stringify(newCartItems));
    props.setCartItems(newCartItems);//要渲header的購物車數量，要以要把新的值傳回去
    window.alert('已加入購物車');
  }

  return (
    <div className="product">
      <img src={state.product.main_image} className="product__main-image" />
      <div className="product__detail">
        <div className="product__title">{state.product.title}</div>
        <div className="product__id">{state.product.id}</div>
        <div className="product__price">TWD.{state.product.price}</div>
        <div className="product__variant">
          <div className="product__color-title">顏色｜</div>
          <RenderProductColorSelector />
        </div>
        <div className="product__variant">
          <div className="product__size-title">尺寸｜</div>
          {renderProductSizeSelector()} 
          {/* 為什麼直接用function，不用jsx */}
        </div>
        <div className="product__variant">
          <div className="product__quantity-title">數量｜</div>
          {renderProductQuantitySelector()}
        </div>
        <button className="product__add-to-cart-button" onClick={addToCart}>
          {state.selectedSize ? '加入購物車' : '請選擇尺寸'}
        </button>
        <div className="product__note">{state.product.note}</div>
        <div className="product__texture">{state.product.texture}</div>
        <div className="product__description">{state.product.description}</div>
        <div className="product__place">素材產地 / {state.product.place}</div>
        <div className="product__place">加工產地 / {state.product.place}</div>
      </div>
      <div className="product__story">
        <div className="product__story-title">細部說明</div>
        <div className="product__story-content">{state.product.story}</div>
      </div>
      <div className="product__images">
        {state.product.images.map((image, index) => (
          <img src={image} className="product__image" key={index} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems, setCartItems] = React.useState(cart);
  return (
    <React.Fragment>
      <Header cartItems={cartItems} />
      <Product cartItems={cartItems} setCartItems={setCartItems} />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
