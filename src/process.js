#!/usr/bin/env node

const Output = require("./output.js")
const Generate = require("./generate.js")
const Enhance = require("./enhance.js")
const argv = require('yargs').argv

console.log("\n --- Dis64 v0.2 OSK Vsn --- ")

//Set and check params
const isPrgFile = !!argv.prg      //BOOLEAN
const inFile = argv.in            //in.prg (can also be bin but needs base setting)
const saveFileName = (argv.out || './dis64_output/') + "/"    //out.asm
const basicUpstart = argv.basic   //0x0900
const range = argv.range || '0x0000-0xffff';
const model = argv.model || "C64";  // C64, VIC20, VIC203K+, VIC208K+

let baseAddr = argv.base          //0x0800 (or derived from prg if flag set)

if(!inFile) {
    console.log("ERROR:  No input file specified. Use --in")
    process.exit(1)
}
if(!saveFileName) {
    console.log("ERROR: No output file specified. Use --out")
    process.exit()
}

if(!isPrgFile && typeof baseAddr === "undefined") {
    console.log("No base address provided for non PRG file, assuming $0000")
    baseAddr = 0
}

let sourceCode = Generate(inFile, baseAddr, isPrgFile, range, basicUpstart);

Enhance.RemoveBadCode(sourceCode, range);
Enhance.DetermineEnvironment(sourceCode, model);
Enhance.DivideByteSections(sourceCode, 16);

Enhance.GenerateLabels(sourceCode, model); 
Enhance.FlattenByteSequences(sourceCode);
Enhance.DivideByteSections(sourceCode, 16);


Output.FormatOutput(sourceCode);
Output.SaveCode(inFile, saveFileName, sourceCode, basicUpstart, model)
