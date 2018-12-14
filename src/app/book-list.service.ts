import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {ServerUrls} from './server-urls';
import {ServerStateService} from './server-state/server-state.service';
import {AuthenticationService} from './authentication/authentication.service';

export class BookMeta {
  constructor(
    public id: string,
    public name: string,
    public created: string,
  ) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class BookListService {
  books: Array<BookMeta> = [];
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private serverState: ServerStateService,
    private auth: AuthenticationService,
  ) {
  }

  listBooks() {
    this.http.get<{books: Array<BookMeta>}>(ServerUrls.listBooks()).subscribe(
      books => {
        this.books = books.books;
      },
      error => {
        const resp = error as Response;
        if (resp.status === 504) {
          this.errorMessage = 'Server is unavailable.';
        } else {
          this.errorMessage = 'Unknown server error (' + resp.status + ').';
        }

      });
  }

  selectBook(bookId: string) {
    this.router.navigate(['book', bookId]);
  }
}