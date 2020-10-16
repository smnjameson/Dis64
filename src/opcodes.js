const opcodes = [
    //$00
    [null,null],
    // ["brk", ""],
    ["ora", "izx"],
    [null,null],
    [null,null],
    [null,null],
    ["ora", "zp"],
    ["asl", "zp"],
    [null,null],

    //$08
    ["php", ""],
    ["ora", "imm"],
    ["asl", ""],
    [null,null],
    [null,null],
    ["ora", "abs"],
    ["asl", "abs"],
    [null,null],

    //$10
    ["bpl", "rel"],
    ["ora", "izy"],
    [null,null],
    [null,null],
    [null,null],
    ["ora","zpx"],
    ["asl","zpx"],
    [null,null],

    //$18
    ["clc",""],
    ["ora","aby"],
    [null,null],
    [null,null],
    [null,null],
    ["ora","abx"],
    ["asl","abx"],
    [null,null],

    //$20
    ["jsr","abs"],
    ["and","izx"],
    [null,null],
    [null,null],
    ["bit","zp"],
    ["and","zp"],
    ["rol","zp"],
    [null,null],

    //$28
    ["plp",""],
    ["and","imm"],
    ["rol",""],
    [null,null],
    ["bit","abs"],
    ["and","abs"],
    ["rol","abs"],
    [null,null],

    //$30
    ["bmi","rel"],
    ["and","izy"],
    [null,null],
    [null,null],
    [null,null],
    ["and","zpx"],
    ["rol","zpx"],
    [null,null],

    //$38
    ["sec",""],
    ["and","aby"],
    [null,null],
    [null,null],
    [null,null],
    ["and","abx"],
    ["rol","abx"],
    [null,null],

    //$40
    ["rti",""],
    ["eor","izx"],
    [null,null],
    [null,null],
    [null,null],
    ["eor","zp"],
    ["lsr","zp"],
    [null,null],

    //$48
    ["pha",""],
    ["eor","imm"],
    ["lsr",""],
    [null,null],
    ["jmp","abs"],
    ["eor","abs"],
    ["lsr","abs"],
    [null,null],

    //$50
    ["bvc","rel"],
    ["eor","izy"],
    [null,null],
    [null,null],
    [null,null],
    ["eor","zpx"],
    ["lsr","zpx"],
    [null,null],

    //$58
    ["cli",""],
    ["eor","aby"],
    [null,null],
    [null,null],
    [null,null],
    ["eor","abx"],
    ["lsr","abx"],
    [null,null],

    //$60
    ["rts",""],
    ["adc","izx"],
    [null,null],
    [null,null],
    [null,null],
    ["adc","zp"],
    ["ror","zp"],
    [null,null],

    //$68
    ["pla",""],
    ["adc","imm"],
    ["ror",""],
    [null,null],
    ["jmp","ind"],
    ["adc","abs"],
    ["ror","abs"],
    [null,null],

    //$70
    ["bvs","rel"],
    ["adc","izy"],
    [null,null],
    [null,null],
    [null,null],
    ["adc","zpx"],
    ["ror","zpx"],
    [null,null],

    //$78
    ["sei",""],
    ["adc","aby"],
    [null,null],
    [null,null],
    [null,null],
    ["adc","abx"],
    ["ror","abx"],
    [null,null],

    //$80
    [null,null],
    ["sta","izx"],
    [null,null],
    [null,null],
    ["sty","zp"],
    ["sta","zp"],
    ["stx","zp"],
    [null,null],

    //$88
    ["dey",""],
    [null,null],
    ["txa",""],
    [null,null],
    ["sty","abs"],
    ["sta","abs"],
    ["stx","abs"],
    [null,null],

    //$90
    ["bcc","rel"],
    ["sta","izy"],
    [null,null],
    [null,null],
    ["sty","zpx"],
    ["sta","zpx"],
    ["stx","zpy"],
    [null,null],

    //$98
    ["tya",""],
    ["sta","aby"],
    ["txs",""],
    [null,null],
    [null,null],
    ["sta","abx"],
    [null,null],
    [null,null],

    //$a0
    ["ldy","imm"],
    ["lda","izx"],
    ["ldx","imm"],
    [null,null],
    ["ldy","zp"],
    ["lda","zp"],
    ["ldx","zp"],
    [null,null],

    //$a8
    ["tay",""],
    ["lda","imm"],
    ["tax",""],
    [null,null],
    ["ldy","abs"],
    ["lda","abs"],
    ["ldx","abs"],
    [null,null],

    //$b0
    ["bcs","rel"],
    ["lda","izy"],
    [null,null],
    [null,null],
    ["ldy","zpx"],
    ["lda","zpx"],
    ["ldx","zpy"],
    [null,null],

    //$b8
    ["clv",""],
    ["lda","aby"],
    ["tsx",""],
    [null,null],
    ["ldy","abx"],
    ["lda","abx"],
    ["ldx","aby"],
    [null,null],

    //$c0
    ["cpy","imm"],
    ["cmp","izx"],
    [null,null],
    [null,null],
    ["cpy","zp"],
    ["cmp","zp"],
    ["dec","zp"],
    [null,null],

    //$c8
    ["iny",""],
    ["cmp","imm"],
    ["dex",""],
    [null,null],
    ["cpy","abs"],
    ["cmp","abs"],
    ["dec","abs"],
    [null,null],

    //$d0
    ["bne","rel"],
    ["cmp","izy"],
    [null,null],
    [null,null],
    [null,null],
    ["cmp","zpx"],
    ["dec","zpx"],
    [null,null],

    //$d8
    ["cld",""],
    ["cmp","aby"],
    [null,null],
    [null,null],
    [null,null],
    ["cmp","abx"],
    ["dec","abx"],
    [null,null],

    //$e0
    ["cpx","imm"],
    ["sbc","izx"],
    [null,null],
    [null,null],
    ["cpx","zp"],
    ["sbc","zp"],
    ["inc","zp"],
    [null,null],

    //$e8
    ["inx",""],
    ["sbc","imm"],
    ["nop",""],
    [null,null],
    ["cpx","abs"],
    ["sbc","abs"],
    ["inc","abs"],
    [null,null],

    //$f0
    ["beq","rel"],
    ["sbc","izy"],
    [null,null],
    [null,null],
    [null,null],
    ["sbc","zpx"],
    ["inc","zpx"],
    [null,null],

    //$f8
    ["sed",""],
    ["sbc","aby"],
    [null,null],
    [null,null],
    [null,null],
    ["sbc","abx"],
    ["inc","abx"],
    [null,null],




]

module.exports = opcodes