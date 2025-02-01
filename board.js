export class Board
{
    static get Void() { return "X"; }
    static get Empty() { return "_"; }
    static get Black() { return "B"; }
    static get White() { return "W"; }

    static cellToString(cell)
    {
	switch(cell)
	{
	    case 0: return "_";
	    case 1: return "B";
	    case 2: return "W";
	    case 3: return "X";
	    default: throw Error("Unknown cell type " + cell);
	}
    }

    constructor(data, width, height, player, isPass)
    {
	this.data = data;
	this.width = width;
	this.height = height;

	this.player = player;
	this.isPass = isPass;
    }

    static fromImage(image, player, isPass)
    {
	let data = new Int8Array(image.length * image[0].length);

	for(let y=0;y<image.length;y++)
	    for(let x=0;x<image[y].length;x++)
	{
	    let value = null;
	    switch(image[y][x])
	    {
		case Board.Void: value = 3; break;
		case Board.Empty: value = 0; break;
		case Board.Black: value = 1; break;
		case Board.White: value = 2; break;
		default: throw Error("Wrong board cell " + image[y][x]);
	    }

	    data[y * image[0].length + x] = value;
	}

	return new Board(data, image[0].length, image.length, (player == "B") ? 1 : 2, isPass);
    }

    toImage()
    {
	let result = [];
	for(let y=0;y<this.height;y++)
	{
	    let line = [];
	    for(let x=0;x<this.width;x++)
		line.push(Board.cellToString(this.getValue(y * this.width + x)));
	    result.push(line.join(""));
	}

	return result;
    }

    code()
    {
	let result = BigInt(0);
	let shift = 0;
	for(let value of this.data)
	{
	    if(value != 0)
		result += BigInt(value) << BigInt(shift);
	    shift += 2;
	}

	return result;
    }

    pack()
    {
	let result = BigInt(this.player - 1);
	if(this.isPass)
	    result += BigInt(2);
	
	result += this.code() << BigInt(2);

	return result;
    }

    static unpack(value, width, height)
    {
	let player = Number(value & BigInt(1)) + 1;
	let isPass = (Number(value & BigInt(3)) >> 1) == 1;

	let shift = 2;
	let dataSize = width * height;
	let data = new Int8Array(dataSize);

	for(let i=0;i<dataSize;i++)
	{
	    data[i] = Number(value >> BigInt(shift)) & 3;
	    shift += 2;
	}

	return new Board(data, width, height, player, isPass);
    }

    get opponent() { return 3 - this.player; }

    pointToString(p)
    {
	return "(" + (p % this.width) + "," + Math.floor(p / this.width) + ")";
    }

    toStrings() {
	let header = (this.player == 1) ? "B" : "W";
	if(this.isPass)
	    header += " (pass)";

	let result = [header];
	for(let y=0;y<this.height;y++)
	{
	    let line = [];
	    for(let x=0;x<this.width;x++)
		line.push(this.getValue(y * this.width + x));

	    result.push(line.map(v => Board.cellToString(v)).join(""));
	}

	return result;
    }

    getValue(p) {
	return this.data[p];
    }

    setValue(p, value) {
	this.data[p] = value;
    }
}
