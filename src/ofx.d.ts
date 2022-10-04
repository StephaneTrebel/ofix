declare module 'ofx' {
  export as namespace ofx;
  interface SIGNONMSGSRSV1 {
    SONRS: {
      STATUS: {
        CODE: string;
        SEVERITY: string;
      };
      DTSERVER: string;
      LANGUAGE: string;
    };
  }

  interface BANKMSGSRSV1 {
    STMTTRNRS: {
      TRNUID: string;
      STATUS: {
        CODE: string;
        SEVERITY: string;
      };
      STMTRS: {
        CURDEF: string;
        BANKACCTFROM: {
          BANKID: string;
          BRANCHID: string;
          ACCTID: string;
          ACCTTYPE: string;
        };
        LEDGERBAL: {
          BALAMT: string;
          DTASOF: string;
        };
        AVAILBAL: {
          BALAMT: string;
          DTASOF: string;
        };
      };
    };
  }

  interface STMTTRN {
    TRNTYPE: string;
    DTPOSTED: string;
    TRNAMT: string;
    FITID: string;
    NAME: string;
    MEMO: string;
  }

  interface CCSTMTTRNR {
    TRNUID: string;
    STATUS: {
      CODE: string;
      SEVERITY: string;
    };
    CCSTMTRS: {
      CURDEF: string;
      CCACCTFROM: {
        ACCTID: string;
      };
      BANKTRANLIST: {
        DTSTART: string;
        DTEND: string;
        STMTTRN: Array<STMTTRN>;
      };
      LEDGERBAL: {
        BALAMT: string;
        DTASOF: string;
      };
      AVAILBAL: {
        BALAMT: string;
        DTASOF: string;
      };
    };
  }

  interface CREDITCARDMSGSRSV1 {
    CCSTMTTRNRS: Array<CCSTMTTRNR>;
  }

  interface HEADER {
    OFXHEADER: string;
    DATA: string;
    VERSION: string;
    SECURITY: string;
    ENCODING: string;
    CHARSET: string;
    COMPRESSION: string;
    OLDFILEUID: string;
    NEWFILEUID: string;
  }

  interface OFX {
    SIGNONMSGSRSV1: SIGNONMSGSRSV1;
    BANKMSGSRSV1: BANKMSGSRSV1;
    CREDITCARDMSGSRSV1: CREDITCARDMSGSRSV1;
  }

  export interface ParsedOFX {
    OFX: OFX;
    header: HEADER;
  }

  export function parse(input: string): ParsedOFX;
  export function serialize(header: HEADER, body: OFX): string;
}
