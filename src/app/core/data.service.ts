import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map, tap, catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { allBooks, allReaders } from 'app/data';
import { Reader } from "app/models/reader";
import { Book } from "app/models/book";
import { BookTrackerError } from 'app/models/bookTrackerError';
import { OldBook } from 'app/models/oldBook';

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

  mostPopularBook: Book = allBooks[0];

  setMostPopularBook(popularBook: Book): void {
    this.mostPopularBook = popularBook;
  }

  // Demo code to get hard coded data when not using HttpClient API
  getAllReaders(): Reader[] {
     return allReaders;
  }

  // Demo code to get hard coded data when not using HttpClient API
  getReaderById(id: number): Reader {
    
    return allReaders.find(reader => reader.readerID === id);
  }

  
  
  // URL  /api/books
  // Note: this api can return one of 2 kinds of observables
  getAllBooks(): Observable<Book[] | BookTrackerError> {
    console.log('Getting all books from the server.');
    return this.http.get<Book[]>('/api/books')
      .pipe(
        // When there is an error, the system calls the function we provide inside the .catchError()
        // and gives it an HttpErrorResponse object for our use to extract error information out of
        catchError(err => this.x(err))  
      );
  }

  private x(error: HttpErrorResponse): Observable<BookTrackerError> {
    let dataError = new BookTrackerError();
    dataError.errorNumber = 100;
    dataError.message = error.statusText;
    dataError.friendlyMessage = 'An error occurred retrieving data.';
    return ErrorObservable.create(dataError);
  }
  
  

  // URL  e.g. /api/books/5
  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`/api/books/${id}`, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': 'my-token'
      })
    });
  }  

  getOldBookById(id: number): Observable<OldBook> {
    return this.http.get<Book>(`/api/books/${id}`)
      .pipe(
        map(b => <OldBook>{     // TYPE ASSERTION, what is called Type Casting in some languages
          bookTitle: b.title,
          year: b.publicationYear
        }),
        tap(classicBook => console.log(classicBook))
      );
  }

  // URL  /api/books
  addBook(newBook: Book): Observable<Book> {
    // You might think that why are we expecting a book back ... see   (<Book>)... , when we are in fact adding a book.
    // well, according to REST ... after a resource is SUCCESSFULLY added the added resource's location and the resource should be returned
    // back to the caller together with a http status code of 201 (meaning created)
    return this.http.post<Book>('/api/books', newBook, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // URL  e.g. /api/books/5
  updateBook(updatedBook: Book): Observable<void> {
  // Note the <void>, because we are not expecting any data back from the .put() api
  // of course we will get http status pf 204 (meaning no content)... but that is not considered data
    return this.http.put<void>(`/api/books/${updatedBook.bookID}`, updatedBook, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // URL  e.g. api/books/5
  deleteBook(bookID: number): Observable<void> {
  // Note the <void>, because we are not expecting any data back from the .delete() api
  // of course we will get http status pf 204 (meaning no content)... but that is not considered data
    return this.http.delete<void>(`/api/books/${bookID}`);
  }
  
}
