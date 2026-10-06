# Breach search and pagination

The existing `GET /api/breaches/latest` endpoint now keeps all eligible HIBP
records in its six-hour in-memory cache, instead of only the latest twelve.
Records remain verified, non-spam-list and non-retired, ordered by AddedDate.

Examples:

```text
/api/breaches/latest?page=1&pageSize=6
/api/breaches/latest?page=2&pageSize=6
/api/breaches/latest?page=1&pageSize=6&search=Adobe
```

Search matches name, title or domain, case-insensitively, across the entire
catalogue before pagination. Encode the search value with `encodeURIComponent`.
Reset page to 1 when the search changes. Search is limited to 200 characters.

The response retains its existing fields and adds `page`, `pageSize`, `total`,
`totalAvailable`, `totalPages`, `hasPreviousPage`, `hasNextPage` and `search`.
The default page size is 6, with a maximum of 12 per response. The old `limit`
parameter still works, so existing dashboard requests continue to return
the first page. An out-of-range page returns the last page. Empty results
return page 1, totalPages 0 and both navigation flags false.

The frontend must add search and pagination controls to use these parameters;
this backend update alone does not add controls to RecentBreaches.jsx.
No database migration or API key is required. Deploying the updated backend
is a separate step from pushing this code to GitHub.

Run the tests from the backend directory:

```sh
npm test
```
