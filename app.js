// Simple inventory manager using localStorage
const LS_KEY = 'sigea_products_v1'

function uid(){return Math.random().toString(36).slice(2,9)}

function load(){
  try{
    return JSON.parse(localStorage.getItem(LS_KEY))||{products:[], history:[], totalSold:0}
  }catch(e){
    return {products:[], history:[], totalSold:0}
  }
}

function save(state){localStorage.setItem(LS_KEY,JSON.stringify(state))}

let state = load()

// Helpers
function formatMoney(v){return 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}

// UI refs
const form = document.getElementById('product-form')
const nameInput = document.getElementById('name')
const priceInput = document.getElementById('price')
const qtyInput = document.getElementById('quantity')
const tbody = document.querySelector('#products-table tbody')
const totalStockEl = document.getElementById('total-stock')
const totalSoldEl = document.getElementById('total-sold')
const distinctCountEl = document.getElementById('distinct-count')
const historyEl = document.getElementById('history')
const clearBtn = document.getElementById('clear-storage')
const resetSalesBtn = document.getElementById('reset-sales')
const clearHistoryBtn = document.getElementById('clear-history')

function render(){
  // products
  tbody.innerHTML = ''
  state.products.forEach(p=>{
    const tr = document.createElement('tr')
    const total = (p.price * p.quantity)
    tr.innerHTML = `
      <td><div class="name">${escapeHtml(p.name)}</div></td>
      <td>${formatMoney(p.price)}</td>
      <td>${p.quantity}</td>
      <td>${formatMoney(total)}</td>
      <td>
        <button class="action-btn" data-id="${p.id}" data-action="add">+ Entrada</button>
        <button class="sell-btn" data-id="${p.id}" data-action="sell">Vender</button>
        <button class="action-btn" data-id="${p.id}" data-action="remove">Remover</button>
      </td>`
    tbody.appendChild(tr)
  })

  // reports
  const totalStock = state.products.reduce((s,p)=>s + p.price * p.quantity,0)
  totalStockEl.textContent = formatMoney(totalStock)
  totalSoldEl.textContent = formatMoney(state.totalSold||0)
  distinctCountEl.textContent = state.products.length

  // history
  historyEl.innerHTML = ''
  state.history.slice().reverse().forEach(h=>{
    const li = document.createElement('li')
    li.innerHTML = `<div><strong>${escapeHtml(h.type)}</strong> · <span class="small">${escapeHtml(h.label)}</span></div><div class="small">${formatMoney(h.amount)}</div>`
    historyEl.appendChild(li)
  })
}

function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}

form.addEventListener('submit',e=>{
  e.preventDefault()
  const name = nameInput.value.trim()
  const price = Number(priceInput.value)||0
  const qty = Math.max(1, Math.floor(Number(qtyInput.value)||1))
  if(!name || price<=0 || qty<=0) return alert('Preencha nome, preço e quantidade válidos')

  // if product exists by exact name, increase quantity
  let prod = state.products.find(p=>p.name.toLowerCase()===name.toLowerCase() && p.price===price)
  if(prod){
    prod.quantity += qty
  }else{
    prod = {id:uid(), name, price, quantity:qty}
    state.products.push(prod)
  }

  state.history.push({type:'Entrada', label:`${qty} × ${prod.name}`, amount: price*qty, ts:Date.now()})
  save(state)
  render()
  form.reset()
})

tbody.addEventListener('click',e=>{
  const btn = e.target.closest('button')
  if(!btn) return
  const id = btn.dataset.id
  const action = btn.dataset.action
  const product = state.products.find(p=>p.id===id)
  if(!product) return

  if(action==='add'){
    const addQty = Number(prompt('Quantidade a adicionar', '1'))||0
    if(addQty>0){
      product.quantity += addQty
      state.history.push({type:'Entrada', label:`${addQty} × ${product.name}`, amount: product.price*addQty, ts:Date.now()})
      save(state); render()
    }
  }else if(action==='sell'){
    const sellQty = Math.min(product.quantity, Number(prompt('Quantidade a vender', '1'))||0)
    if(sellQty>0){
      product.quantity -= sellQty
      const amount = product.price*sellQty
      state.totalSold = (state.totalSold||0) + amount
      state.history.push({type:'Venda', label:`${sellQty} × ${product.name}`, amount, ts:Date.now()})
      // remove product if zero
      if(product.quantity<=0) state.products = state.products.filter(p=>p.id!==product.id)
      save(state); render()
    }
  }else if(action==='remove'){
    if(confirm('Remover produto definitivamente?')){
      state.products = state.products.filter(p=>p.id!==product.id)
      state.history.push({type:'Remoção', label:product.name, amount:0, ts:Date.now()})
      save(state); render()
    }
  }
})

clearBtn.addEventListener('click',()=>{
  if(confirm('Limpar todos os dados do sistema?')){
    localStorage.removeItem(LS_KEY)
    state = {products:[], history:[], totalSold:0}
    render()
  }
})

resetSalesBtn.addEventListener('click',()=>{
  if(!confirm('Zerar o total vendido? Essa ação não apagará o histórico (registrará a ação).')) return
  state.totalSold = 0
  state.history.push({type:'Zerar vendas', label:'Zerou total de vendas', amount:0, ts:Date.now()})
  save(state)
  render()
})

clearHistoryBtn.addEventListener('click',()=>{
  if(!confirm('Tem certeza? Isso apagará todo o histórico de transações.')) return
  state.history = []
  save(state)
  render()
})

// initial render
render()
