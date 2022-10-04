import { readFileSync } from 'fs';
import { join } from 'path';

import { ParsedOFX } from 'ofx';

import { main, fixFITID } from './main';
const mockFile = readFileSync(
  join(__dirname, '../test/CA20210928_184319_simple.ofx'),
  {
    encoding: 'utf8',
  }
);

const baseOFX: ParsedOFX = {
  OFX: {
    SIGNONMSGSRSV1: {
      SONRS: {
        STATUS: {
          CODE: '0',
          SEVERITY: 'INFO',
        },
        DTSERVER: '20210928184319',
        LANGUAGE: 'FRA',
      },
    },
    BANKMSGSRSV1: {
      STMTTRNRS: {
        TRNUID: 'redacted',
        STATUS: {
          CODE: '0',
          SEVERITY: 'INFO',
        },
        STMTRS: {
          CURDEF: 'EUR',
          BANKACCTFROM: {
            BANKID: '13606',
            BRANCHID: '00028',
            ACCTID: 'redacted',
            ACCTTYPE: 'CHECKING',
          },
          LEDGERBAL: {
            BALAMT: '+1461.95',
            DTASOF: '20210928',
          },
          AVAILBAL: {
            BALAMT: '+1461.95',
            DTASOF: '20210928',
          },
        },
      },
    },
    CREDITCARDMSGSRSV1: {
      CCSTMTTRNRS: [
        {
          TRNUID: 'redacted',
          STATUS: {
            CODE: '0',
            SEVERITY: 'INFO',
          },
          CCSTMTRS: {
            CURDEF: 'EUR',
            CCACCTFROM: {
              ACCTID: 'redacted',
            },
            BANKTRANLIST: {
              DTSTART: '20210822000000',
              DTEND: '20210925235959',
              STMTTRN: [
                {
                  TRNTYPE: 'OTHER',
                  DTPOSTED: '20210925',
                  TRNAMT: '-200.00',
                  FITID: 'foo',
                  NAME: 'CAUDARD MOQUETT REDON',
                  MEMO: '.',
                },
              ],
            },
            LEDGERBAL: {
              BALAMT: '+469.37',
              DTASOF: '20210930',
            },
            AVAILBAL: {
              BALAMT: '+673.65',
              DTASOF: '20211029',
            },
          },
        },
        {
          TRNUID: 'redacted',
          STATUS: {
            CODE: '0',
            SEVERITY: 'INFO',
          },
          CCSTMTRS: {
            CURDEF: 'EUR',
            CCACCTFROM: {
              ACCTID: 'redacted',
            },
            BANKTRANLIST: {
              DTSTART: '20210818000000',
              DTEND: '20210926235959',
              STMTTRN: [
                {
                  TRNTYPE: 'OTHER',
                  DTPOSTED: '20210926',
                  TRNAMT: '-23.40',
                  FITID: 'bar',
                  NAME: 'PAYPAL LUXEMBOURG',
                  MEMO: '.',
                },
              ],
            },
            LEDGERBAL: {
              BALAMT: '+2244.23',
              DTASOF: '20210930',
            },
            AVAILBAL: {
              BALAMT: '+813.62',
              DTASOF: '20211029',
            },
          },
        },
      ],
    },
  },
  header: {
    OFXHEADER: '100',
    DATA: 'OFXSGML',
    VERSION: '102',
    SECURITY: 'NONE',
    ENCODING: 'USASCII',
    CHARSET: '1252',
    COMPRESSION: 'NONE',
    OLDFILEUID: 'NONE',
    NEWFILEUID: 'NONE',
  },
};

const mockDependencies = {
  logger: { log: () => {} },
  ofx: { parse: () => ({ ...baseOFX }), serialize: () => '' },
  readFile: () => Promise.resolve(mockFile),
  writeFile: () => Promise.resolve(),
} as any;

describe('main()', () => {
  describe('When called with its dependencies and a file list', () => {
    it('Should return Void', () => {
      expect(
        main(mockDependencies)({ filenameList: [''], outDir: '' })
      ).resolves.toBeUndefined();
    });
  });
});

describe('fixFITID()', () => {
  describe('When called with an OFX object', () => {
    it('Should return a different OFX object having updated FITID', () => {
      expect(fixFITID({ ...baseOFX })).toEqual({
        OFX: {
          BANKMSGSRSV1: {
            STMTTRNRS: {
              STATUS: { CODE: '0', SEVERITY: 'INFO' },
              STMTRS: {
                AVAILBAL: { BALAMT: '+1461.95', DTASOF: '20210928' },
                BANKACCTFROM: {
                  ACCTID: 'redacted',
                  ACCTTYPE: 'CHECKING',
                  BANKID: '13606',
                  BRANCHID: '00028',
                },
                CURDEF: 'EUR',
                LEDGERBAL: { BALAMT: '+1461.95', DTASOF: '20210928' },
              },
              TRNUID: 'redacted',
            },
          },
          CREDITCARDMSGSRSV1: {
            CCSTMTTRNRS: [
              {
                CCSTMTRS: {
                  AVAILBAL: { BALAMT: '+673.65', DTASOF: '20211029' },
                  BANKTRANLIST: {
                    DTEND: '20210925235959',
                    DTSTART: '20210822000000',
                    STMTTRN: [
                      {
                        DTPOSTED: '20210925',
                        FITID: '20210925-CAUDARD MOQUETT REDON-OTHER--200.00',
                        MEMO: '.',
                        NAME: 'CAUDARD MOQUETT REDON',
                        TRNAMT: '-200.00',
                        TRNTYPE: 'OTHER',
                      },
                    ],
                  },
                  CCACCTFROM: { ACCTID: 'redacted' },
                  CURDEF: 'EUR',
                  LEDGERBAL: { BALAMT: '+469.37', DTASOF: '20210930' },
                },
                STATUS: { CODE: '0', SEVERITY: 'INFO' },
                TRNUID: 'redacted',
              },
              {
                CCSTMTRS: {
                  AVAILBAL: { BALAMT: '+813.62', DTASOF: '20211029' },
                  BANKTRANLIST: {
                    DTEND: '20210926235959',
                    DTSTART: '20210818000000',
                    STMTTRN: [
                      {
                        DTPOSTED: '20210926',
                        FITID: '20210926-PAYPAL LUXEMBOURG-OTHER--23.40',
                        MEMO: '.',
                        NAME: 'PAYPAL LUXEMBOURG',
                        TRNAMT: '-23.40',
                        TRNTYPE: 'OTHER',
                      },
                    ],
                  },
                  CCACCTFROM: { ACCTID: 'redacted' },
                  CURDEF: 'EUR',
                  LEDGERBAL: { BALAMT: '+2244.23', DTASOF: '20210930' },
                },
                STATUS: { CODE: '0', SEVERITY: 'INFO' },
                TRNUID: 'redacted',
              },
            ],
          },
          SIGNONMSGSRSV1: {
            SONRS: {
              DTSERVER: '20210928184319',
              LANGUAGE: 'FRA',
              STATUS: { CODE: '0', SEVERITY: 'INFO' },
            },
          },
        },
        header: {
          CHARSET: '1252',
          COMPRESSION: 'NONE',
          DATA: 'OFXSGML',
          ENCODING: 'USASCII',
          NEWFILEUID: 'NONE',
          OFXHEADER: '100',
          OLDFILEUID: 'NONE',
          SECURITY: 'NONE',
          VERSION: '102',
        },
      });
    });
  });
});
