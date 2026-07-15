const axios = require('axios');
const express = require('express');
const path = require('path');
const iconv_lite_1 = require("iconv-lite");

// 创建一个 express 应用
const server = express();

server.use(express.static(path.join(__dirname, 'public')));


/* stock */
server.get('/stock', async (req, res) => {
    var { list } = req.query;
    if(!list){
        list = 'sh000001,sh601127,sh603108,sh513100,sz000572,sh600418,sz000868,sz002271,sh600733,sz000980,sz000625,hkHSMPI'//USDCNH,hkHSMPI
    }
    const url = `https://hq.sinajs.cn/list=${list}`
    try {
        // 调用外部接口
        const response = await axios.get(url, 
            {
                // axios 乱码解决
                responseType: 'arraybuffer',
                transformResponse: [
                    (data) => {
                        return (0, iconv_lite_1.decode)(data, 'GB18030');
                    },
                ],
                headers: {
                    Referer: 'http://finance.sina.com.cn/'
                }
            }
        );
        // 返回外部接口的响应
        const list = response.data.split('str_').slice(1);
        let gp = {}
        for(let i in list){
            gp[i] = {}
            // test_look
            // for(let j in list[i].split(',')){gp[i][j] = list[i].split(',')[j]}
            let gpl = list[i].split(',');
            if(gpl[0].startsWith('hk')){
                gp[i].name = gpl[1]
                gp[i].price = gpl[6]
                gp[i].pcent = gpl[8]+'%';
            }else if(gpl[0].startsWith('usr_')){
                gp[i].name = gpl[0]
                gp[i].price = gpl[2]+'%'
            }else{
                gp[i].name = gpl[0]
                gp[i].price = gpl[3];
                gp[i].pcent = ((gpl[3] - gpl[2])/gpl[2]*100).toFixed(2)+'%';
                gp[i].liang = gpl[9].slice(0, -8);
            }
        }
        res.json(gp);


    } catch (error) {
        console.error('Error calling external API:', error.message);
        res.status(500).send('Error calling external API');
    }
})


// server.get('/', (req, res) => {
//   res.json({ status: 'ok', status2: 'ok2', endpoint: '/stock?list=sh000001' });
// });

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});