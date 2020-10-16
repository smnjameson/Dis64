Disassembler for C64 - 6502 assembly, outputs in Kick Assembler format.

Requires NodeJS installed

The disassemblewr will attempt to do its best to detect VIC Bank allocation and Screen buffers, adding labels where it thinks they are used. Additionally it will add system labels where detected and provide a syslabels include file.

It will also try to detect and ignore dead code (code that doesnt end in RTI, RTS, JMP, JSR or Branch instructions)

**Setup:
```
npm install
```

**Usage:
```
npm run dis64 -- --in %infile% [Options]
```

**Parameters:


*--in %File%

The file to disassemble, can be any binary file.

*--out %Folder%

The output folder for the disassembly files, if the folder does not exist it wi ll be created.

*--prg

Signifies that the input file is a PRG and uses its load address to determine the base address for disassembly. Without this flag the disassembly will assume a base address of $0000

*--basic %address%

If provided will insert a BasicUpstart2 directive into a patched segment pointing to the given address, useful if you know the entry point of the program and that there is free space at $0801 to add a BASIC SYS command. Use JS hex format, e.g. 0x0900.

*--range

If provided limits the disassembly to the given memory range, anything falling outside this memory range will be treated as simple byte data. Use JS hex format as follows:
*--range 0x2000-0xcfff



**Usage Example:

```
npm run dis64 -- --in base.prg --prg --out ./MyGame --basic 0xc000
```
Disassembles a prg file and outputs the results to a folder called MyGame inserting a BasicUpstart2 directive to launch the code from BASIC