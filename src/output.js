const path = require('path')
const fs = require('fs');
const Utils = require("./utils.js")
const Enhance = require("./enhance.js")
const ncp = require('ncp').ncp
const C64SysLabels = require("./syslabels.js")
const VIC20SysLabels = require("./syslabels.js")

const Output = {


    FormatOutput: (sourceCode) => {
        for(var i=0; i<sourceCode.length; i++){
            let op = sourceCode[i]
            if(!op.opcode && op.base !== -1 && i>0) {    
                if(sourceCode[i-1].opcode) op.src = "\n"+ op.src
                if(i+1 < sourceCode.length && !!sourceCode[i+1].opcode) op.src = op.src + "\n"
            } 
        }  
        return sourceCode
    },

    
    SaveCode: (inFile, file, src, basic, model) => {
        let fileNamePlain = inFile.match(/[\\|\/]?(\w+)(?:\.\w+)?[\\\/]*$/)[1]

        //Imports
        let out = `//Standard imports\n#import "./syslabels.asm"\n\n`

        //Dynamic location labelling
        if(Enhance.SCREEN_BUFFERS.length) out += "//Potential screen buffer locations\n"
        for(var i=0; i<Enhance.SCREEN_BUFFERS.length; i++) {
            out += `.label SCREEN_BUFFER_${i} = $${Enhance.SCREEN_BUFFERS[i].toString(16).padStart(4,"0")}\n`
        }

        //Basic Upstart?
        if(basic && fileNamePlain) {
            out += "\n//Basic upstart patching\n"
            out += `.file [name="${fileNamePlain}.prg", segments="Base,Patch", allowOverlap]\n`
            out += `.segmentdef Base []\n`
            out += `.segmentdef Patch []\n`
            out += `.segment Patch\n`
            out += `    BasicUpstart2($${basic.toString(16).padStart(4,"0")})\n\n\n`
            
            out += `.segment Base\n`
        }

        //Code
        out += `\n//Start of disassembled code\n`
        for(var i=0; i<src.length; i++) {
            if(src[i].label) {
               
                if(!src[i].opcode && src[i].base>=0) {
                    out += `\n    ${src[i].label}:\n `
                    out += src[i].src.substr(1) + "\n"
                } else {
                    out += `    ${src[i].label}:\n`
                    out += src[i].src + "\n"            
                }
                
            } else {
                out += src[i].src + "\n"            
            }

            if(src[i].opcode === "rts") out += "\n\n"
        }

        try {
            fs.mkdirSync(path.resolve(process.cwd(), file));
        } catch (e) {}
        
        fs.writeFileSync( path.resolve(process.cwd(), file, fileNamePlain+".asm"), out)
        
        if (model.substring(0,5).toLowerCase() === "vic20"){
            var sysLabelsOut = `.label VICCR0 = $9000
.label VICCR1 = $9001
.label VICCR2 = $9002
.label VICCR3 = $9003
.label VICCR4 = $9004
.label VICCR5 = $9005
.label VICCR6 = $9006
.label VICCR7 = $9007
.label VICCR8 = $9008
.label VICCR9 = $9009
.label VICCRA = $900A
.label VICCRB = $900B
.label VICCRC = $900C
.label VICCRD = $900D
.label VICCRE = $900E
.label VICCRF = $900F
.label VIA1PB = $9110
.label VIA1PA1 = $9111
.label VIA1DDRB = $9112
.label VIA1DDRA = $9113
.label VIA1T1CL = $9114
.label VIA1T1CH = $9115
.label VIA1T1LL = $9116
.label VIA1T1LH = $9117
.label VIA1T2CL = $9118
.label VIA1T2CH = $9119
.label VIA1SR = $911A
.label VIA1ACR = $911B
.label VIA1PCR = $911C
.label VIA1IFR = $911D
.label VIA1IER = $911E
.label VIA1PA2 = $911F
.label VIA2PB = $9210
.label VIA2PA1 = $9211
.label VIA2DDRB = $9212
.label VIA2DDRA = $9213
.label VIA2T1CL = $9214
.label VIA2T1CH = $9215
.label VIA2T1LL = $9216
.label VIA2T1LH = $9217
.label VIA2T2CL = $9218
.label VIA2T2CH = $9219
.label VIA2SR = $921A
.label VIA2ACR = $921B
.label VIA2PCR = $921C
.label VIA2IFR = $921D
.label VIA2IER = $921E
.label VIA2PA2 = $921F
`;
            if (model.toLowerCase() === "vic208k+"){
                sysLabelsOut += `.label vColorRam = $9400`
            }
            else {
                sysLabelsOut += `.label vColorRam = $9600`
            }

        }
        else {
            var sysLabelsOut = `.label vSprite0X = $d000 
.label vSprite0Y = $d001 
.label vSprite1X = $d002 
.label vSprite1Y = $d003 
.label vSprite2X = $d004 
.label vSprite2Y = $d005 
.label vSprite3X = $d006 
.label vSprite3Y = $d007 
.label vSprite4X = $d008 
.label vSprite4Y = $d009 
.label vSprite5X = $d00a 
.label vSprite5Y = $d00b 
.label vSprite6X = $d00c 
.label vSprite6Y = $d00d 
.label vSprite7X = $d00e 
.label vSprite7Y = $d00f 
.label vSpriteXMSB = $d010 
.label vScreenControl1 = $d011
.label vRaster = $d012 
.label vLightPenX = $d013 
.label vLightPenY = $d014 
.label vSprEnable = $d015 
.label vScreenControl2 = $d016
.label vSprExpandY = $d017 
.label vMemControl = $d018 
.label vIRQFlags = $d019 
.label vIRQMasks = $d01a 
.label vSprPriority = $d01b 
.label vSprMCM = $d01c 
.label vSprExpandX = $d01d 
.label vSprSprColl = $d01e 
.label vSprBackColl = $d01f 
.label vBorderCol = $d020 
.label vBackgCol0 = $d021 
.label vBackgCol1 = $d022 
.label vBackgCol2 = $d023 
.label vBackgCol3 = $d024 
.label vSprMCMCol0 = $d025 
.label vSprMCMCol1 = $d026 
.label vSpr0Col = $d027 
.label vSpr1Col = $d028 
.label vSpr2Col = $d029 
.label vSpr3Col = $d02a 
.label vSpr4Col = $d02b 
.label vSpr5Col = $d02c 
.label vSpr6Col = $d02d 
.label vSpr7Col = $d02e 
.label sVoc1FreqLo = $d400 
.label sVoc1FreqHi = $d401 
.label sVoc1PWidthLo = $d402 
.label sVoc1PWidthHi = $d403 
.label sVoc1Control = $d404 
.label sVoc1AttDec = $d405 
.label sVoc1SusRel = $d406 
.label sVoc2FreqLo = $d407 
.label sVoc2FreqHi = $d408 
.label sVoc2PWidthLo = $d409 
.label sVoc2PWidthHi = $d40a 
.label sVoc2Control = $d40b 
.label sVoc2AttDec = $d40c 
.label sVoc2SusRel = $d40d 
.label sVoc3FreqLo = $d40e 
.label sVoc3FreqHi = $d40f 
.label sVoc3PWidthLo = $d410 
.label sVoc3PWidthHi = $d411 
.label sVoc3Control = $d412 
.label sVoc3AttDec = $d413 
.label sVoc3SusRel = $d414 
.label sFiltFreqLo = $d415 
.label sFiltFreqHi = $d416 
.label sFiltControl = $d417 
.label sFiltMode = $d418 
.label sADC1 = $d419 
.label sADC2 = $d41a 
.label sRandom = $d41b 
.label sVoc3Outpu = $d41c 

.label vColorRam = $d800

.label cCia1PortA = $dc00
.label cCia1PortB = $dc01
.label cCia1DDRA = $dc02
.label cCia1DDRB = $dc03
.label cCia1TimerALo = $dc04
.label cCia1TimerAHi = $dc05
.label cCia1TimerBLo = $dc06
.label cCia1TimerBHi = $dc07
.label cCia1TODten = $dc08
.label cCia1TODsec = $dc09
.label cCia1TODmin = $dc0a
.label cCia1TODhrs = $dc0b
.label cCia1SSR = $dc0c
.label cCia1IntControl = $dc0d
.label cCia1TimerAControl = $dc0e
.label cCia1TimerbControl = $dc0f

.label cCia2PortA = $dd00
.label cCia2PortB = $dd01
.label cCia2DDRA = $dd02
.label cCia2DDRB = $dd03
.label cCia2TimerALo = $dd04
.label cCia2TimerAHi = $dd05
.label cCia2TimerBLo = $dd06
.label cCia2TimerBHi = $dd07
.label cCia2TODten = $dd08
.label cCia2TODsec = $dd09
.label cCia2TODmin = $dd0a
.label cCia2TODhrs = $dd0b
.label cCia2SSR = $dd0c
.label cCia2IntControl = $dd0d
.label cCia2TimerAControl = $dd0e
.label cCia2TimerbControl = $dd0f        
`;
        }

        fs.writeFileSync( path.resolve(process.cwd(), file, "syslabels.asm"), sysLabelsOut)
    }
}

module.exports = Output