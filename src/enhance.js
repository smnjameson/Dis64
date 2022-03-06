const Utils = require("./utils.js")
const SysLabels = require("./syslabels.js")

const Enhance = {
    VIC_BASE: 0x0000,
    SCREEN_BUFFERS: [0x0400],
    COLOUR_BUFFER: 0xd800,
    SCREEN_LENGTH: 0x03e8,

    DetermineEnvironment(sourceCode, model) {
        //Examine code and try determine some things such
        //as VIC bank used and Screen Buffer locations

        if (model.substring(0,5).toLowerCase() === "vic20"){
            Enhance.SCREEN_BUFFERS = [0x1e00];
            Enhance.COLOUR_BUFFER = 0x9600;
            Enhance.SCREEN_LENGTH = 0x01fa;

            if (model.toLowerCase() === "vic208k+"){
                Enhance.SCREEN_BUFFERS = [0x1000];
                Enhance.COLOUR_BUFFER = 0x9400;
            }
        }
        // console.log(model.substring(0,5).toLowerCase());
        // console.log(Enhance.SCREEN_BUFFERS, Enhance.COLOUR_BUFFER,Enhance.SCREEN_LENGTH);

        var lastIndex=0
        for(var i=0; i<sourceCode.length; i++) {
            if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Examining code for vic banking: ${Math.round((i/sourceCode.length) * 100)}%\r`);
            let op = sourceCode[i]

            //Find vic bank
            if(op.target === 0xdd00 && op.mode === "abs") {
                if ((op.opcode === "sta" && (sourceCode[i-1].opcode === "lda" || sourceCode[i-1].opcode === "ora") && sourceCode[i-1].mode === "imm") ||
                    (op.opcode === "stx" && sourceCode[i-1].opcode === "ldx" && sourceCode[i-1].mode === "imm") ||
                    (op.opcode === "sty" && sourceCode[i-1].opcode === "ldy" && sourceCode[i-1].mode === "imm")) {
                        Enhance.VIC_BASE = [0xc000, 0x8000, 0x4000, 0x0000][sourceCode[i-1].bytes[1] & 3]
                } 
            }
        }
        console.log("\r")

        
        if (model.substring(0,3).toLowerCase() === "c64"){
            lastIndex = 0;
            for(var i=0; i<sourceCode.length; i++) {
                if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Examining code for screen ram areas: ${Math.round((i/sourceCode.length) * 100)}%\r`);
                let op = sourceCode[i]

                //And try to find screen buffers
                if(op.target === 0xd018 && op.mode === "abs") {    
                    if ((op.opcode === "sta" && sourceCode[i-1].opcode === "lda" && sourceCode[i-1].mode === "imm") ||
                        (op.opcode === "stx" && sourceCode[i-1].opcode === "ldx" && sourceCode[i-1].mode === "imm") ||
                        (op.opcode === "sty" && sourceCode[i-1].opcode === "ldy" && sourceCode[i-1].mode === "imm")) {

                            let sBuffer = [ 0x0000, 0x0400, 0x0800, 0x0c00, 0x1000, 0x1400, 0x1800, 0x1c00,
                                            0x2000, 0x2400, 0x2800, 0x2c00, 0x3000, 0x3400, 0x3800, 0x3c00, ][(sourceCode[i-1].bytes[1] >> 4) & 15 ]
                            if(Enhance.SCREEN_BUFFERS.indexOf(Enhance.VIC_BASE + sBuffer) === -1) {
                                Enhance.SCREEN_BUFFERS.push(Enhance.VIC_BASE + sBuffer)
                            }
                    } 
                }
            }
        }
        
        
        console.log("\r")
        return sourceCode
    },



    RemoveBadCode(sourceCode, range) {
        //Check through the source making sure all code leads to either
        //an rti, rts, jmp, jsr or branch instruction
        //Otherwise mark all code up to that point as bytes
        //If nothing before branch then ignore it
        range = range.split("-").map(a => parseInt(a,16))

        var lastIndex=0
        for(var i=0; i<sourceCode.length; i++) {
            if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Cleaning bad branches: ${Math.round((i/sourceCode.length) * 100)}%\r`);
            let op = sourceCode[i]

            if(op.mode === "rel") {
                if(op.target >=range[0] && op.target<range[1] && !Utils.IsValidTarget(op.target, sourceCode)) {
                    sourceCode[i] = Utils.FormatByteLine(sourceCode[i])
                }
            }
        }
        console.log("\r")




        let firstIns = -1;
        lastIndex=0
        for(var i=0; i<sourceCode.length; i++) {
            if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Cleaning bad code: ${Math.round((i/sourceCode.length) * 100)}%\r`);
            let op = sourceCode[i]

            if(op.base >= 0) {
                

                if(op.opcode && op.target !== null && op.mode !== "imm" && op.mode !== "rel" && op.target < 256 && !Utils.IsZP(op.mode)){ // THIS code fails for sta $0001,y as it uses ZP when assembled ---> && op.mode !== "aby" && op.mode !== "abx") {
                    if(op.mode === "aby" || op.mode === "abx" || op.mode === "abs") {
                        op.src = op.src.replace(/([a-zA-Z]{3})/, "$1.a")
                    } else {
                        
                        sourceCode[i].opcode = null
                        sourceCode[i] = Utils.FormatByteLine(sourceCode[i])
                        op = sourceCode[i]
                    }

                    
                } else {
                    if(!op.opcode && firstIns > -1) {
                        //Now check previous
                        if(!Utils.IsValidEndPoint(sourceCode[i-1], sourceCode[i-2])) {
                            for(var j=firstIns; j<i; j++) {
                                sourceCode[j] = Utils.FormatByteLine(sourceCode[j])
                            }
                        }
                        firstIns = -1;
                    } else if(op.opcode && (Utils.IsValidEndPoint(op, sourceCode[i-1]) )) {
                        firstIns = i + 1
                    } else {

                    }
                }
            }
        }
        console.log("\r")

        
        sourceCode = Enhance.FlattenByteSequences(sourceCode);
        return sourceCode;      
    },








    GenerateLabels(sourceCode, model) {

        if (model.substring(0,5).toLowerCase() === "vic20"){
            var sysLabels = SysLabels.VIC20SysLabels;
            console.log('Vic SysLabels')
        }
        else{
            var sysLabels = SysLabels.C64SysLabels;
            console.log('C64 SysLabels')
        }

        //console.log(model, sysLabels);
        //console.log(Enhance.COLOUR_BUFFER.toString(16), Enhance.COLOUR_BUFFER.toString(16).padStart(2,"0"), sysLabels[Enhance.COLOUR_BUFFER.toString(16).padStart(4,"0")], Enhance.COLOUR_BUFFER)
        var lastIndex=0
        for(var i=0; i<sourceCode.length; i++) {
            if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Generating label: ${Math.round((i/sourceCode.length) * 100)}%\r`);

            let op = sourceCode[i]
            if(op.target) {
                let found = false;
                //COLRAM
                if (op.opcode !== "jsr" && op.opcode !== "jmp" && op.mode !== "rel" && op.target >= Enhance.COLOUR_BUFFER && op.target < Enhance.COLOUR_BUFFER + Enhance.SCREEN_LENGTH) {
                    op.src = op.src.replace(/\$[0-9a-fA-F]{1,4}/, sysLabels[Enhance.COLOUR_BUFFER.toString(16).padStart(4,"0")] + " + $" + (op.target - Enhance.COLOUR_BUFFER).toString(16).padStart(2,"0"))
                    found = true
                } else if(Enhance.SCREEN_BUFFERS.length) {
                    //SCREEN BUFFERS
                    for(var j=0; j< Enhance.SCREEN_BUFFERS.length; j++) {
                        if (op.opcode !== "jsr" && op.opcode !== "jmp" && op.mode !== "rel" && op.target >= Enhance.SCREEN_BUFFERS[j] && op.target < Enhance.SCREEN_BUFFERS[j] + Enhance.SCREEN_LENGTH) {
                            op.src = op.src.replace(/\$[0-9a-fA-F]{1,4}/, "SCREEN_BUFFER_" + (j) + " + $" + (op.target - Enhance.SCREEN_BUFFERS[j]).toString(16).padStart(2,"0"))
                            found = true
                        }
                    }
                } 

                //SYSLABELS
                if(!found) {
                    if(sysLabels[op.target.toString(16)]) {
                        op.src = op.src.replace(/\$[0-9a-fA-F]{1,4}/, sysLabels[op.target.toString(16)])      

                    //OTHERLABELS
                    } else {
                        let lao = Utils.GetLabelAndOffset(sourceCode, op.target)
                        if(lao) {
                            op.src = op.src.replace(/\$[0-9a-fA-F]{1,4}/, lao.offset ? `${lao.label} + $${lao.offset.toString(16)}` : lao.label)
                        }
                    }
                }
            }
        }
        console.log("\r")


        //Clean unreached (unlabelled code)
        lastIndex=0
        for(var i=1; i<sourceCode.length; i++) {
            if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Cleaning unreached code: ${Math.round((i/sourceCode.length) * 100)}%\r`);
            let op = sourceCode[i]

            if(op.opcode && !sourceCode[i-1].opcode && !op.label) {
                sourceCode[i] = Utils.FormatByteLine(sourceCode[i])
            }
        }
        console.log("\r")

        return sourceCode
    },


    // FindLocalBranches(sourceCode) {
    //     lastIndex=0
    //     for(var i=1; i<sourceCode.length; i++) {
    //         if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Cleaning unreached code: ${Math.round((i/sourceCode.length) * 100)}%\r`);
    //         let op = sourceCode[i]

    //         if(op.opcode && !sourceCode[i-1].opcode && !op.label) {
    //             sourceCode[i] = Utils.FormatByteLine(sourceCode[i])
    //         }
    //     }
    //     console.log("\r")

    //     return sourceCode
    // },


    DivideByteSections(sourceCode, max) {
        var lastIndex=0
        for(var i=0; i<sourceCode.length; i++){
            if(lastIndex+10<i) lastIndex=i && process.stdout.write(`Tidying byte sections: ${Math.round((i/sourceCode.length) * 100)}%\r`);
           
            let op = sourceCode[i]
            if(!op.opcode && op.base !== -1 && !op.label) {

                //check for consecutive bytes more than 16
                let bCount = 0;
                let bMatch = -1;
                let bStart = -1
                for(var j=0; j<op.bytes.length; j++) {
                    if(op.bytes[j] !== bMatch) {
                        if(bCount>16) break;
                        bMatch = op.bytes[j]
                        bCount = 1;
                        bStart = j;
                    } else {
                        bCount++;
                    }
                }
                if(bCount > 16) {
                    let fill = sourceCode[i].bytes.splice(bStart);
                    let overflow = fill.splice(bCount);
                    sourceCode[i] =  Utils.FormatByteLine(sourceCode[i]);
                    sourceCode.splice(i + 1, 0, Utils.FormatFillLine({
                        base: op.base + bStart,
                        bytes: fill 
                    }))                     
                    if(overflow.length) sourceCode.splice(i + 2, 0, Utils.FormatByteLine({
                        base: op.base + bStart + bCount,
                        bytes: overflow 
                    }))   
                    if(!sourceCode[i].bytes.length) sourceCode.splice(i,1)                        
                }

                if(op.bytes.length > max) {
                    let overflow = sourceCode[i].bytes.splice(max)
                    sourceCode[i] =  Utils.FormatByteLine(sourceCode[i])
                    sourceCode.splice(i + 1, 0, Utils.FormatByteLine({
                       base: op.base + max,
                       bytes: overflow 
                    }))
                }   
            } 
        }
        console.log("\r")
        return sourceCode
    },
    






    FlattenByteSequences(sourceCode) {
        let firstBytes = -1;
        var lastIndex = 0;

        for(var index = 0; index < sourceCode.length; index++) {
            if(lastIndex+10<index) lastIndex=index && process.stdout.write(`Flattening byte sequences: ${Math.round((index/sourceCode.length) * 100)}%\r`);
           
            let op = sourceCode[index];
            if(op.opcode || op.base === -1 || op.label) {
                if(firstBytes !== -1) {
                    sourceCode[firstBytes] = Utils.FormatByteLine(sourceCode[firstBytes])
                }
                firstBytes = -1;
            } else {
                if(firstBytes === -1) {
                    firstBytes = index
                } else {
                    sourceCode[firstBytes].bytes.push(...op.bytes)
                    sourceCode.splice(index,1)
                    index--;
                }
            } 
        }
        console.log("\r")
        return sourceCode;
    },

}
module.exports = Enhance