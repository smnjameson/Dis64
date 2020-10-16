const Utils = {
    GetLabelAndOffset(sourceCode, tgt) {
        let result = {}
        for(var i=0; i<sourceCode.length; i++) {
            let op = sourceCode[i]
            if(op.base === tgt || (op.base >= 0 && !op.opcode && tgt > op.base && tgt < op.base + op.bytes.length)) {
                result.label = op.label = "L_" + op.base.toString(16).padStart(4,"0")
                result.offset = tgt - op.base
                return result
            }
        }
        return null
    },

    FormatByteLine(op) {
        return {
             base: op.base,
             src: `        .byte ${op.bytes.map(a => ("$"+a.toString(16).padStart(2,"0"))).join(",")}`,
             label: "",
             target:null,
             bytes: op.bytes,
             opcode: null,
             mode: null,
             fill: false                          
         }
    },

    FormatFillLine(op) {
        return {
             base: op.base,
             src: `        .fill $${op.bytes.length.toString(16)}, $${op.bytes[0].toString(16)}`,
             label: "",
             target:null,
             bytes: op.bytes,
             opcode: null,
             mode: null,
             fill: true                            
         }
    },

    IsValidEndPoint(op, prevOp) {
        // console.log(`checking @ ${op.base.toString(16).padStart(4,0)} - ${op.opcode} & ${op.mode}`)
        if(op.opcode === "rts") return true
        if(op.opcode === "rti") return true
        if(op.opcode === "jmp") return true
        if(op.mode === "ind") return true
        // if(op.mode === "rel") return true //Maybe required as some routines may termiante in an always taken branch
        if(op.opcode === "jsr") return true

        
        if(op.mode === "rel" && !prevOp.opcode) return false
        if(op.base === -1) return false
        return false
    },
    
    IsValidTarget(tgt, sourceCode) {
        for(var i=0; i<sourceCode.length; i++) {
            if(sourceCode[i].opcode && sourceCode[i].base === tgt) return true
        }
        return false;
    },

    IsZP(mode) {
        return (    mode === "zp" ||
                    mode === "zpx" ||
                    mode === "zpy" ||
                    mode === "izx" ||
                    mode === "izy");
    }
}

module.exports = Utils