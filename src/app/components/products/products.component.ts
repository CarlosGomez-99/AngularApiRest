import { Component, OnInit } from '@angular/core';

import { Product, ProductDTO, UpdateProductDTO } from '../../models/product.model';

import { StoreService } from '../../services/store.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  myShoppingCart: Product[] = [];
  total = 0;
  products: Product[] = [];
  showProductDetail = false;
  productChosen: Product = {
    id: '',
    price: 0,
    images: [],
    title: '',
    category: {
      id: '',
      name: '',
    },
    description: ''
  };
  limit = 10;
  offset = 0;

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService
  ) {
    this.myShoppingCart = this.storeService.getShoppingCart();
  }

  ngOnInit(): void {
    this.loadMore();
  }

  onAddToShoppingCart(product: Product) {
    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail() {
    this.showProductDetail = !this.showProductDetail;
  }

  onShowDetail(id: string) {
    this.productsService.getProductById(id)
      .subscribe(data => {
        if (!this.showProductDetail)
          this.toggleProductDetail();
        this.productChosen = data;
      });
  }

  createNewProduct() {
    const product: ProductDTO = {
      title: 'Nuevo producto',
      description: 'bla bla bla',
      images: [`https://picsum.photos/640/640?r=${Math.random()}`],
      price: 1000,
      categoryId: 2
    }
    this.productsService.create(product)
      .subscribe(data => {
        console.log('created', data);
        this.products.unshift(data);
      });
  }

  updateProduct() {
    const changes: UpdateProductDTO = {
      title: 'Nuevo titulo',
      // description: 'nueva descripción',
      // images: [`https://picsum.photos/640/640?r=${Math.random()}`],
      // price: 1000,
      // categoryId: 2
    }
    const id = this.productChosen.id;
    this.productsService.update(id, changes)
      .subscribe(data => {
        console.log('updated', data);
        this.productChosen = data; //Actualizar objeto seleccionado en product-detail
        const productIndex = this.products.findIndex(item => item.id === id); //Buscar index del producto actualizado
        this.products[productIndex] = data; //Actualizar producto en el array
      });
  }

  deleteProduct() {
    const id = this.productChosen.id;
    this.productsService.delete(id)
      .subscribe(() => {
        console.log('delete');
        const productIndex = this.products.findIndex(item => item.id === id); //Buscar index del producto eliminado
        this.products.splice(productIndex, 1);
        this.showProductDetail = false;
      });
  }

  loadMore() {
    this.productsService.getAllProducts(this.limit, this.offset)
      .subscribe(data => {
        console.log(data)
        let arrayCount: number = this.products.length;
        if (arrayCount === 0) {
          this.products = data;
        } else {
         this.products = this.products.concat(data);
        }
        this.offset += this.limit;
      });
  }
}
