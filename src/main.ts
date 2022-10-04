import { readFile, writeFile } from 'fs';
import { basename, join } from 'path';

import { promisify } from 'util';
const readFilePromisifed = promisify(readFile);
const writeFilePromisifed = promisify(writeFile);

import { option } from 'argv';
import glob from 'glob';
const globPromisifed = promisify(glob);

import * as ofx from 'ofx';

type Main = (dependencies: {
  logger: typeof console;
  ofx: typeof ofx;
  readFile: typeof readFilePromisifed;
  writeFile: typeof writeFilePromisifed;
}) => (params: {
  filenameList: Array<string>;
  outDir: string;
}) => Promise<void>;
export const main: Main = ({ logger, readFile, ofx, writeFile }) => ({
  filenameList,
  outDir,
}) =>
  Promise.all(
    filenameList.map((filename) => {
      logger.log(`Begin fixing file ${filename}...`);
      return readFile(filename, { encoding: 'utf8' })
        .then(ofx.parse)
        .then(fixFITID)
        .then((fixedOFX) => ofx.serialize(fixedOFX.header, fixedOFX.OFX))
        .then((serializeOFX) => {
          const outputFilename = join(
	    outDir,
            `${basename(filename, '.ofx')}_fixed.ofx`
	  );
          return writeFile(outputFilename, serializeOFX).then(
            () => outputFilename
          );
        })
        .then((outputFilename) =>
          logger.log(`File ${outputFilename} has been written.`)
        )
    	.catch((error) => logger.error(`FATAL: ${error.message} during handling of file ${filename}.`));
    })
  )
    .then(() => logger.log(`Finished !`))

/**
 * Fix FITID field.
 *
 * Some banks do not use a unique value for the FITID _across filenameList_, so a FITID
 * may be unique in a file but is changes afterwards to another, unique, FITID,
 * making the transaction wrongly «new» (because the FITID changed).
 *
 * Fixing the FITID to a value that will be 99% unique across filenameList makes it more
 * useful over time (when we have to continuously import OFX filenameList having old
 * transactions).
 */
type FixFITID = (inputOFX: ofx.ParsedOFX) => ofx.ParsedOFX;
export const fixFITID: FixFITID = (inputOFX) => ({
  ...inputOFX,
  OFX: {
    ...inputOFX.OFX,
    CREDITCARDMSGSRSV1: {
      ...inputOFX.OFX.CREDITCARDMSGSRSV1,
      CCSTMTTRNRS: inputOFX.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.map(
        (cardStatement) => ({
          ...cardStatement,
          CCSTMTRS: {
            ...cardStatement.CCSTMTRS,
            BANKTRANLIST: {
              ...cardStatement.CCSTMTRS.BANKTRANLIST,
              STMTTRN: cardStatement.CCSTMTRS.BANKTRANLIST.STMTTRN.map(
                (statement) => ({
                  ...statement,
                  FITID: `${statement.DTPOSTED}-${statement.NAME}-${statement.TRNTYPE}-${statement.TRNAMT}`,
                })
              ),
            },
          },
        })
      ),
    },
  },
});

if (process.env['NODE_ENV'] !== 'test') {
  // Argv setup
  const args = option([
    {
      name: 'inputDir',
      short: 'i',
      type: 'path',
      description:
        'Defines input folder for source OFX filenameList. Default to current directory',
      example: "'ofix --inputDir=.' or 'ofix -i=myDir'",
    },
    {
      name: 'outDir',
      short: 'o',
      type: 'path',
      description:
        'Defines target folder for fixed OFX filenameList. Default to current directory',
      example: "'ofix --outDir=/tmp' or 'ofix -o=.'",
    },
    {
      name: 'help',
      short: 'h',
      type: 'string',
      description: 'Show help and usage info.',
      example: "'ofix --help'",
    },
  ]).run();

  if (args.options['h'] || args.options['help']) {
    console.log(`ofix - A way to fix OFX files
usage: ofix --inputDir=<input_directory> --outDir=<output_directory>

Will fix all files in <input_directory> and write a fixed version in <output_directory>.`);

    process.exit(0);
  }

  if (!args.options['inputDir']) {
    console.error(`--inputDir/-i is mandatory`);
    process.exit(1);
  }

  if (!args.options['outDir']) {
    console.error(`--outDir/-o is mandatory`);
    process.exit(1);
  }

  globPromisifed(`${args.options['inputDir']}/*.ofx`)
    .then((filenameList) =>
      // Main execution
      main({
        logger: console,
        ofx,
        readFile: readFilePromisifed,
        writeFile: writeFilePromisifed,
      })({
        filenameList,
        outDir: args.options['outDir'],
      })
    )
    .then(() => console.log('Job complete'))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
