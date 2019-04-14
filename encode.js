const extract = require('png-chunks-extract');
const encode = require('png-chunks-encode');
const text = require('png-chunk-text');
const path = require('path');
const fs = require('fs');
const keyword_dot = 'RG90RG90RG90';
const crypt = (buffer, user_text) => {
    let encTxt;
    if(!user_text || user_text.length < 1)
        encTxt = 'V2UncmUgbm8gc3RyYW5nZXJzIHRvIGxvdmUKWW91IGtub3cgdGhlIHJ1bGVzIGFuZCBzbyBkbyBJCkEgZnVsbCBjb21taXRtZW50J3Mgd2hhdCBJJ20gdGhpbmtpbmcgb2YKWW91IHdvdWxkbid0IGdldCB0aGlzIGZyb20gYW55IG90aGVyIGd1eQpJIGp1c3Qgd2FubmEgdGVsbCB5b3UgaG93IEknbSBmZWVsaW5nCkdvdHRhIG1ha2UgeW91IHVuZGVyc3RhbmQKTmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXAKTmV2ZXIgZ29ubmEgbGV0IHlvdSBkb3duCk5ldmVyIGdvbm5hIHJ1biBhcm91bmQgYW5kIGRlc2VydCB5b3UKTmV2ZXIgZ29ubmEgbWFrZSB5b3UgY3J5Ck5ldmVyIGdvbm5hIHNheSBnb29kYnllCk5ldmVyIGdvbm5hIHRlbGwgYSBsaWUgYW5kIGh1cnQgeW91CldlJ3ZlIGtub3duIGVhY2ggb3RoZXIgZm9yIHNvIGxvbmcKWW91ciBoZWFydCdzIGJlZW4gYWNoaW5nIGJ1dCB5b3UncmUgdG9vIHNoeSB0byBzYXkgaXQKSW5zaWRlIHdlIGJvdGgga25vdyB3aGF0J3MgYmVlbiBnb2luZyBvbgpXZSBrbm93IHRoZSBnYW1lIGFuZCB3ZSdyZSBnb25uYSBwbGF5IGl0CkFuZCBpZiB5b3UgYXNrIG1lIGhvdyBJJ20gZmVlbGluZwpEb24ndCB0ZWxsIG1lIHlvdSdyZSB0b28gYmxpbmQgdG8gc2VlCk5ldmVyIGdvbm5hIGdpdmUgeW91IHVwCk5ldmVyIGdvbm5hIGxldCB5b3UgZG93bgpOZXZlciBnb25uYSBydW4gYXJvdW5kIGFuZCBkZXNlcnQgeW91Ck5ldmVyIGdvbm5hIG1ha2UgeW91IGNyeQpOZXZlciBnb25uYSBzYXkgZ29vZGJ5ZQpOZXZlciBnb25uYSB0ZWxsIGEgbGllIGFuZCBodXJ0IHlvdQpOZXZlciBnb25uYSBnaXZlIHlvdSB1cApOZXZlciBnb25uYSBsZXQgeW91IGRvd24KTmV2ZXIgZ29ubmEgcnVuIGFyb3VuZCBhbmQgZGVzZXJ0IHlvdQpOZXZlciBnb25uYSBtYWtlIHlvdSBjcnkKTmV2ZXIgZ29ubmEgc2F5IGdvb2RieWUKTmV2ZXIgZ29ubmEgdGVsbCBhIGxpZSBhbmQgaHVydCB5b3UKTmV2ZXIgZ29ubmEgZ2l2ZSwgbmV2ZXIgZ29ubmEgZ2l2ZQooR2l2ZSB5b3UgdXApCihPb2gpIE5ldmVyIGdvbm5hIGdpdmUsIG5ldmVyIGdvbm5hIGdpdmUKKEdpdmUgeW91IHVwKQpXZSd2ZSBrbm93biBlYWNoIG90aGVyIGZvciBzbyBsb25nCllvdXIgaGVhcnQncyBiZWVuIGFjaGluZyBidXQgeW91J3JlIHRvbyBzaHkgdG8gc2F5IGl0Ckluc2lkZSB3ZSBib3RoIGtub3cgd2hhdCdzIGJlZW4gZ29pbmcgb24KV2Uga25vdyB0aGUgZ2FtZSBhbmQgd2UncmUgZ29ubmEgcGxheSBpdApJIGp1c3Qgd2FubmEgdGVsbCB5b3UgaG93IEknbSBmZWVsaW5nCkdvdHRhIG1ha2UgeW91IHVuZGVyc3RhbmQKTmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXAKTmV2ZXIgZ29ubmEgbGV0IHlvdSBkb3duCk5ldmVyIGdvbm5hIHJ1biBhcm91bmQgYW5kIGRlc2VydCB5b3UKTmV2ZXIgZ29ubmEgbWFrZSB5b3UgY3J5Ck5ldmVyIGdvbm5hIHNheSBnb29kYnllCk5ldmVyIGdvbm5hIHRlbGwgYSBsaWUgYW5kIGh1cnQgeW91Ck5ldmVyIGdvbm5hIGdpdmUgeW91IHVwCk5ldmVyIGdvbm5hIGxldCB5b3UgZG93bgpOZXZlciBnb25uYSBydW4gYXJvdW5kIGFuZCBkZXNlcnQgeW91Ck5ldmVyIGdvbm5hIG1ha2UgeW91IGNyeQpOZXZlciBnb25uYSBzYXkgZ29vZGJ5ZQpOZXZlciBnb25uYSB0ZWxsIGEgbGllIGFuZCBodXJ0IHlvdQpOZXZlciBnb25uYSBnaXZlIHlvdSB1cApOZXZlciBnb25uYSBsZXQgeW91IGRvd24KTmV2ZXIgZ29ubmEgcnVuIGFyb3VuZCBhbmQgZGVzZXJ0IHlvdQpOZXZlciBnb25uYSBtYWtlIHlvdSBjcnk=';
    else
        encTxt = (new Buffer.from(user_text)).toString('base64');
    const chunks = extract(buffer);
    let cpt = 0;
    let runningText = '';
    while(cpt < encTxt.length){
        runningText += encTxt[cpt];
        cpt++;
        if(Math.random()*100 < 10 && runningText.length > 0){
            chunks.splice(-1, 0, text.encode(keyword_dot, runningText));
            runningText = '';
        }
    }
    if(runningText.length > 0)
        chunks.splice(-1, 0, text.encode(keyword_dot, runningText));
    return Buffer.from(encode(chunks));
}
const decrypt = (buffer) => {
    const chunks = extract(buffer)
    return new Buffer.from(chunks.filter((chunk) => {
        return chunk.name === 'tEXt'
    }).map((chunk) => {
        return text.decode(chunk.data)
    }).filter( e => {
        return e.keyword === keyword_dot;
    }).reduce( (a,e)=>{
        return a+e.text;
    },''),'base64').toString('utf8');
}
module.exports = {crypt:crypt, decrypt:decrypt};