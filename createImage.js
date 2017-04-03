var exec = require('child_process').exec;
var fs = require('fs');
var gm = require('gm').subClass({imageMagick:true});
var sizeOf = require('image-size');

function addText(ipath,text){
	return new Promise(function(res,rej,err){
		if(err){
			rej(err);
		}
		sizeOf(ipath,function(err,dimensions){
			if(err){
				rej(err);
			}
			var charWidth = 35;
			var numChars = text.length;
			var textWidth = charWidth * numChars;
			console.log(textWidth)
			gm(ipath)			
			.font("ArialB", 50)
			.fill('white')
			.drawText((dimensions.width / 2) - (textWidth / 2), dimensions.height - 20, text)
			.write(ipath,function(err){
				if(err){
					rej(err);
				} else{
					res(ipath);
				}
			});
		})
		
	})
}

module.exports = {
	addText:addText
}