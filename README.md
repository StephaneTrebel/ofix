# About

This repository helps importing OFX in finance management tools by fixing the transaction ID (FITID).
Too many times banks websites change FITID although it is used as a primary key for transaction matching in finance management tools like GNUCash.

Using this project will «fix» FITID in all transactions as such:

```
statement.FITID = `${statement.DTPOSTED}-${statement.NAME}-${statement.TRNTYPE}-${statement.TRNAMT}`
```

## Example

Before:

```
<STMTTRN>
<TRNTYPE>OTHER
<DTPOSTED>20210926
<TRNAMT>-23.40
<FITID>20210926000000001
<NAME>PAYPAL LUXEMBOURG
<MEMO>.
</STMTTRN>
```

After:

```
<STMTTRN>
<TRNTYPE>OTHER
<DTPOSTED>20210926
<TRNAMT>-23.40
<FITID>20210926-PAYPAL LUXEMBOURG-OTHER--23.40
<NAME>PAYPAL LUXEMBOURG
<MEMO>.
</STMTTRN>
```

# How to use

- `npm ci`
- `npm run build`
- `node dist/ofix.js --inputDir=<dir having ofx files to fix> --outDir=<dir receiving fixed ofx files>`
- `outDir` will then have as many files as `inputDir`
- Every file in `outDir` will be suffixed with `_fixed` to avoid overwriting if `inputDir` === `outDir`
- cleanup, either in `inputDir` or `outDir` is left to you

# Tests

Of course there are tests, just `npm run test` !
