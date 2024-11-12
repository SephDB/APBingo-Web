export class Square {
    x: number
    y: number

    static fromName(name:string) {
        let y = name.charCodeAt(0) - 'A'.charCodeAt(0)
        let x = Number(name.slice(1)) - 1
        return new Square(x,y);
    }

    constructor(x:number,y:number) {
        this.x = x
        this.y = y
    }

    get name() {
        return String.fromCharCode(this.y+'A'.charCodeAt(0)) + (this.x+1)
    }

    public toString() {
        return this.name
    }
}

export class Bingo {
    size: number
    squares: boolean[]
    num_bingos: number

    constructor(size:number) {
        this.size = size
        this.squares = Array<boolean>(size*size)
        this.squares.fill(false)
        this.num_bingos = 0
    }

    public square(s:Square) {
        return this.squares[s.y*this.size+s.x]
    }

    get all() {
        return this.squares.every(Boolean)
    }

    public check(s:Square) {
        if(this.squares[s.y*this.size+s.x] === true) {
            //Guard against double checks
            return []
        }
        this.squares[s.y*this.size+s.x] = true
        let ret = Array<string>()
        
        type IndexFn = (a:number) => [number,number]
        const all = (fn:IndexFn) => [...Array(this.size)].map((_,i) => this.square(new Square(...fn(i)))).every(Boolean)
        const bingoname = (start:[number,number],end:[number,number]) => `${new Square(...start)}-${new Square(...end)}`
        const max = this.size-1

        if(all(i=>[s.x,i])) {
            ret.push(bingoname([s.x,0],[s.x,max]))
        }
        if(all(i=>[i,s.y])) {
            ret.push(bingoname([0,s.y],[max,s.y]))
        }
        if(s.x == s.y && all(i=>[i,i])) {
            ret.push(bingoname([0,0],[max,max]))
        }
        if(s.x == max - s.y && all(i=>[i,max - i])) {
            ret.push(bingoname([0,max],[max,0]))
        }
        this.num_bingos += ret.length
        return ret
    }
}