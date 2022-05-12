// ==UserScript==
// @name         0x
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       loe
// @match        https://sunflower-land.com/play*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function() {
    custom_log(['start！'])
    var realtime_pos = new DOMPoint(0, 0)
    var manual_stoping = false
    var is_draging = false
    var is_farming = false
    var box_collecting = false
    var box_clicking = false
    var box_close_clicking = false
    var seed_adding = false
    var seed_processing = false
    var farm_loading = true
    var farm_approved = false

    let farm_open = false
    let approved_farm_ids = ['106296']

    // 监听点击
    document.addEventListener("click", function (ev){
        var oev = ev || event
        let clientX = oev.clientX
        let clientY = oev.clientY

        let element = ev.srcElement
        let element_text = $(element).text()

        // 点击Menu停止/开启种植
        if(element_text){
            if(element_text == 'Menu'){
                // 结束种植
                manual_stoping = !manual_stoping
                // fake
                custom_log(['****** click text:', element_text, '******'])
                if (manual_stoping) {
                    custom_log(['****** 手动停止种植 ******'])
                }else {
                    custom_log(['****** 手动启动种植 ******'])
                }
            }
        }

        // custom_log(['\n'])
        // custom_log(['click!'])
        // console.log(element)
        // custom_log(['横坐标：'+clientX])
        // custom_log(['纵坐标：'+clientY])
        // custom_log(['\n'])
    })

    // 记录实时鼠标位置
    document.addEventListener("mousemove", function (ev){
        var oev = ev || event
        let clientX = oev.clientX
        let clientY = oev.clientY
        realtime_pos = new DOMPoint(clientX, clientY)
    });

    // 检测页面出错，刷新页面
    var reload_waiting = 0
    setInterval(function () {
        let wrong_status = search_something_wrong()
        if(wrong_status) {
            if (reload_waiting == 0) {
                // fake
                custom_log(['****** 页面出错，刷新！ ******'])
                location.reload()
            }

            reload_waiting ++
            if (reload_waiting >= 5) {
                reload_waiting = 0
            }
        }
    }, random_interval(3, 5))

    // 点击Let's farm!
    let interval_start = setInterval(function () {
        let farm_button = search_letsfarm()
        if(farm_button) {
            click_element(farm_button, false)
            // 检查是否loading
            let interval_loading = setInterval(function () {
                let loading = is_loading()
                farm_loading = loading
                if (loading) {
                    // fake
                    custom_log(['****** 加载中 ******'])
                }else {
                    // fake
                    custom_log(['****** 加载完成 ******'])
                    clearInterval(interval_loading)
                }
            }, random_interval(1, 2))

            clearInterval(interval_start)
        }
    }, random_interval(2, 3))

    // 检查农场编号
    if (!farm_open) {
        let interval_id_checking = setInterval(function () {
            let farm_id = search_farm_id()
            if (farm_id) {
                for (var i in approved_farm_ids) {
                    let approved_id = approved_farm_ids[i]
                    if (farm_id == approved_id) {
                        farm_approved = true
                        // fake
                        console.log('****** 农场审核通过 ******')
                        break
                    }
                }
                if (!farm_approved) {
                    // fake
                    console.log('****** 农场不合格 ******')
                }
                clearInterval(interval_id_checking)
            }else {
                // fake
                console.log('****** 无法确认农场 ******')
            }
        }, random_interval(1, 2))
    }else {
        // fake
        farm_approved = true
        console.log('****** 对所有农场开放 ******')
    }

    // 检查是否有种子
    setInterval(function () {
        if (!farm_loading  && !manual_stoping && farm_approved) {
            seed_adding = seed_needed()
            if (seed_adding && !seed_processing) {
                // fake
                custom_log(['****** 种子不够了！ ******'])

                // 切换种子
                var bag = null
                $('.w-8.mb-1').each(function (index, element) {
                    let alt = $(element).attr('alt')
                    if (alt == 'inventory') {
                        // 找到了背包
                        bag = element
                        return false
                    }
                })

                if (bag) {
                    seed_processing = true
                    setTimeout(function () {
                        // fake
                        custom_log(['****** 正在添加种子！ ******'])

                        click_element(bag)
                        setTimeout(function () {
                            // 搜索背包种子
                            let seed_target = search_bag_seeds()
                            if (seed_target) {
                                // 选择种子
                                click_element(seed_target)
                                setTimeout(function () {
                                    // 结束切换种子
                                    let img_x = search_x()
                                    if (img_x) {
                                        click_element(img_x)
                                        seed_processing = false
                                    }
                                }, random_interval(1, 2))
                            }else {
                                seed_processing = false
                                // 没有种子停止种植
                                manual_stoping = true
                            }
                        }, random_interval(1, 2))
                    }, random_interval(2, 3))
                }
            }
        }
    }, 2000)

    // 种植农作物
    var interval_farming = setInterval(()=>{
        if (!manual_stoping && !seed_adding && farm_approved) {
            let search_results = search_crops()
            let crops_ready = search_results[0]
            let crops_preparing = search_results[1]
            let crops_none = search_results[2]

            var available_crops_ready = []
            var available_crops_preparing = []
            var available_crops_none = []

            // 未解锁土地范围
            let locked_area = search_locked_farms_rect()

            // 已成熟作物洞口
            if(crops_ready.length){
                for(var index in crops_ready){
                    let element = crops_ready[index]
                    let rect =  element.getBoundingClientRect()
                    var is_locked = false
                    if(locked_area){
                        if((rect.left >= locked_area.left) & (rect.left+rect.width <= locked_area.left+locked_area.width) & (rect.top >= locked_area.top) & (rect.top+rect.height <= locked_area.top+locked_area.height)) {
                            // 该洞口未解锁
                            is_locked = true
                        }
                    }
                    if(!is_locked) {
                        available_crops_ready.push(element)
                    }
                }
            }
            // fake
            // custom_log(['已成熟作物洞口数量：', crops_ready.length, '可用：', available_crops_ready.length])

            // 待成熟作物洞口
            if(crops_preparing.length){
                for(index in crops_preparing){
                    let element = crops_preparing[index]
                    let rect =  element.getBoundingClientRect()
                    is_locked = false
                    if(locked_area){
                        if((rect.left >= locked_area.left) & (rect.left+rect.width <= locked_area.left+locked_area.width) & (rect.top >= locked_area.top) & (rect.top+rect.height <= locked_area.top+locked_area.height)) {
                            // 该洞口未解锁
                            is_locked = true
                        }
                    }
                    if(!is_locked) {
                        available_crops_preparing.push(element)
                    }
                }
            }
            // fake
            // custom_log(['待成熟作物洞口数量：', crops_preparing.length, '可用：', available_crops_preparing.length])

            // 未种植洞口
            if(crops_none.length){
                for(index in crops_none){
                    let element = crops_none[index]
                    let rect =  element.getBoundingClientRect()
                    is_locked = false
                    if(locked_area){
                        if((rect.left >= locked_area.left) & (rect.left+rect.width <= locked_area.left+locked_area.width) & (rect.top >= locked_area.top) & (rect.top+rect.height <= locked_area.top+locked_area.height)) {
                            // 该洞口未解锁
                            is_locked = true
                        }
                    }
                    if(!is_locked) {
                        available_crops_none.push(element)
                    }
                }
            }
            // fake
            // custom_log(['未种植洞口数量：', crops_none.length, '可用：', available_crops_none.length])

            // 搜寻宝箱
            let box_result = search_box()
            let droped = box_result[0]
            let box = box_result[1]
            if (droped) {
                // fake
                custom_log(['****** 宝箱掉落 ******'])

                box_collecting = true
                if (box && !box_clicking) {
                    // 点击宝箱
                    // fake
                    custom_log(['****** 点击宝箱 ******'])

                    box_clicking = true
                    setTimeout(function () {
                        click_element(box, false)
                    }, random_interval(0.9, 3))
                }

                $('button').each(function (index_button, element_button) {
                    let button_text = $(element_button).text()
                    if(button_text){
                        let re = RegExp('Close')
                        if(button_text.match(re)){
                            if (!box_close_clicking) {
                                box_close_clicking = true
                                setTimeout(function () {
                                    // fake
                                    custom_log(['****** 点击Close ******'])

                                    click_element(element_button, false)
                                }, random_interval(0.5, 1))
                            }
                            return false
                        }
                    }
                })
            }else {
                box_collecting = false
                box_clicking = false
                box_close_clicking = false
            }

            // fake
            if ((available_crops_ready.length || available_crops_none.length) && !box_collecting) {
                // 调整农场位置
                if(!is_draging & !is_farming) {
                    is_draging = true

                    let total_crops = available_crops_ready.concat(available_crops_none)
                    let drag_interval = setInterval(function () {
                        var direction_x = 0
                        var direction_y = 0
                        for (var i in total_crops) {
                            let crop = total_crops[i]
                            let crop_rect = crop.getBoundingClientRect()
                            let direction = drag_direction(crop_rect)
                            let dir_x = direction[0]
                            let dir_y = direction[1]
                            if (dir_x != 0) {
                                direction_x = dir_x
                            }
                            if (dir_y != 0) {
                                direction_y = dir_y
                            }
                        }
                        if (direction_x || direction_y) {
                            drag_to_farming(direction_x, direction_y)
                        }else {
                            // 收菜、种植
                            var is_ready = false
                            var crop = null
                            if(available_crops_ready.length) {
                                is_ready = true
                                crop = available_crops_ready[0]
                            }else if(available_crops_none.length) {
                                crop = available_crops_none[0]
                            }
                            if(crop) {
                                is_farming = true
                                if (is_ready) {
                                    custom_log(['****** 大丰收 ******'])
                                }else {
                                    custom_log(['****** 种植 ******'])
                                }
                                setTimeout(function () {
                                    let click_rect = crop.getBoundingClientRect()
                                    let click_position = new DOMPoint(click_rect.x+click_rect.width*Math.random()*0.9, click_rect.y+click_rect.height*Math.random()*0.9)
                                    move_mouse(null, false, realtime_pos, click_position)
                                    setTimeout(function () {
                                        click_element(crop, is_ready)
                                        is_farming = false
                                    }, 600)
                                }, random_interval(0, 2))
                            }

                            is_draging = false
                            clearInterval(drag_interval)
                        }
                    }, 600)
                }
            }
        }
    }, 500)
})()

// ================ 工具 =====================
// 根据元素坐标获取拖动方向，使元素处于合适的位置
function drag_direction(element_rect) {
    let client_width = document.documentElement.clientWidth        // 浏览器窗口不包含滚动条的宽度
    let client_height = document.documentElement.clientHeight       // 浏览器窗口不包含滚动条的高度

    var direction_x = 0
    var direction_y = 0
    if (element_rect.x <= 20) {
        // 需要向右拖动
        direction_x = 1
    }
    if (element_rect.x+element_rect.width >= client_width-100) {
        // 需要向左拖动
        direction_x = -1
    }
    if (element_rect.y <= 100) {
        // 需要向下拖动
        direction_y = 1
    }
    if (element_rect.y+element_rect.height >= client_height-60) {
        // 需要向上拖动
        direction_y = -1
    }
    return [direction_x, direction_y]
}
// 随机拖动农场
function drag_to_farming(direction_x, direction_y) {
    let client_width = document.documentElement.clientWidth
    let client_height = document.documentElement.clientHeight
    let start_point = new DOMPoint(Math.random()*client_width, Math.random()*client_height)

    var end_x = 0
    var end_y = 0
    if(direction_x == 1){
        // 向右拖动
        end_x = start_point.x + (client_width - start_point.x)*Math.random()*0.5
    }else if (direction_x == -1) {
        // 向左拖动
        end_x = start_point.x - start_point.x*Math.random()*0.5
    }else {
        // 向左一点点
        end_x = start_point.x - start_point.x*Math.random()*0.1
    }

    if(direction_y == 1){
        // 向下拖动
        end_y = start_point.y + (client_height - start_point.y)*Math.random()*0.5
    }else if (direction_y == -1) {
        // 向上拖动
        end_y = start_point.y - start_point.y*Math.random()*0.5
    }else {
        // 向上一点点
        end_y = start_point.y - start_point.y*Math.random()*0.1
    }
    let end_point = new DOMPoint(end_x, end_y)

    // fake
    custom_log(['draging:', direction_x, direction_y])
    move_mouse(null, true, start_point, end_point)
}

// 移动鼠标，拖动元素可选
function move_mouse(target, drag, from_point, to_point){
    if(!from_point || !to_point){
        return false
    }
    target = target || document.elementFromPoint(from_point.x, from_point.y)
    var from_x = from_point.x
    var from_y = from_point.y
    // 移动到初始位置
    var mousemove = document.createEvent("MouseEvents");
    mousemove.initMouseEvent("mousemove",true,true,document.defaultView,0,
            from_x, from_y, from_x, from_y,false,false,false,false,0,null);
    target.dispatchEvent(mousemove);

    if(drag){
        // 按下鼠标
        var mousedown = document.createEvent("MouseEvents");
        // document.defaultView 可替换成 screen.defaultView
        mousedown.initMouseEvent("mousedown",true,true,document.defaultView,0,
                from_x, from_y, from_x, from_y,false,false,false,false,0,null);
        target.dispatchEvent(mousedown);
    }

    var to_x = from_x
    var to_y = from_y
    let x_distance = Math.abs(from_x-to_point.x)
    let y_distance = Math.abs(from_y-to_point.y)
    var x_direction = 0
    var y_direction = 0
    if(to_point.x >= from_x){
        // 向右移动
        x_direction = 1
    }else{
        // 向左移动
        x_direction = -1
    }
    if(to_point.y >= from_y){
        // 向下移动
        y_direction = 1
    }else{
        // 向上移动
        y_direction = -1
    }
    // 移动速度控制【0 < speed < 1】
    let speed = 0.8
    var interval = setInterval(function(){
        if(x_direction > 0){
            // 向右移动
            to_x += Math.ceil(Math.random() * x_distance * speed)
            if(to_x >= to_point.x){
                // 到达指定位置
                to_x = to_point.x
            }
        }else if(x_direction < 0){
            // 向左移动
            to_x -= Math.ceil(Math.random() * x_distance * speed)
            if(to_x <= to_point.x){
                // 到达指定位置
                to_x = to_point.x
            }
        }

        if(y_direction > 0){
            // 向下移动
            to_y += Math.ceil(Math.random() * y_distance * speed)
            if(to_y >= to_point.y){
                // 到达指定位置
                to_y = to_point.y
            }
        }else if(y_direction < 0){
            // 向上移动
            to_y -= Math.ceil(Math.random() * y_distance * speed)
            if(to_y <= to_point.y){
                // 到达指定位置
                to_y = to_point.y
            }
        }

        // 移动鼠标
        var mousemove = document.createEvent("MouseEvents");
        mousemove.initMouseEvent("mousemove",true,true,document.defaultView,0,
                to_x, to_y, to_x, to_y,false,false,false,false,0,null);
        target.dispatchEvent(mousemove);

        if(to_x == to_point.x & to_y == to_point.y){
            clearInterval(interval);
            if(drag){
                // 放开鼠标
                var mouseup = document.createEvent("MouseEvents");
                mouseup.initMouseEvent("mouseup",true,true,document.defaultView,0,
                to_x, to_y, to_x, to_y,false,false,false,false,0,null);
                target.dispatchEvent(mouseup);
            }
        }
    }, 30);
}

// 随机的时间【秒】
function random_interval(min, max) {
    var result = 0
    while(result <= 1000 * min) {
        result = Math.ceil(Math.random() * 1000 * max)
    }
    // fake
    // custom_log(['随机时间：', result/1000, '秒'])
    return result
}

// 当前时间
function full_time() {
    let time_str = new Date(Date.now()).toLocaleString()
    return time_str
}

function simple_time() {
    let time = new Date(Date.now())
    // let year = time.getFullYear()
    // let month = time.getMonth() + 1
    // let day = time.getDate()
    let hour = time.getHours()
    let minute = time.getMinutes()
    let second = time.getSeconds()
    let time_str = hour + ':' + minute + ':' + second
    return time_str
}

// 自定义log
function custom_log(content_list) {
    var full_content = ''
    for (var i in content_list) {
        if (i == 0) {
            full_content += simple_time() + '\t' + content_list[i]
        }else {
            full_content += ' ' + content_list[i]
        }
    }
    if (full_content) {
        console.log(full_content)
    }
}

// ================ 农场 =====================
// 搜寻待成熟进度条
function search_progress_bar() {
    var target_list = []
    $('.w-10').each(function (index, element) {
        let src = $(element).attr('src')
        if(src){
            let re = RegExp('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAHCAYAAADXhRcnAAAAUklEQVQYlWP8//8/')
            if(src.match(re)){
                // 找到待成熟进度条
                target_list.push(element)
            }
        }
    })
    return target_list
}

// 搜寻已成熟、待成熟、未种植洞口，并返回可点击元素数组
function search_crops() {
    var crops_ready = []
    var crops_preparing = []
    var crops_none = []
    $('.relative.group').each(function (index, element) {
        // 确认可点击元素
        var ele_click = null
        var img_list = $(element).find('img')
        $(img_list).each(function (index_img, ele_image) {
            let style = $(ele_image).attr('style')
            if(style == 'opacity: 0.1;'){
                ele_click = ele_image
                return false
            }
        })

        // 确认是否已成熟
        var confirm = false
        img_list = $(element).find('img')
        $(img_list).each(function (index_img, ele_image) {
            var id = $(ele_image).attr('id')
            if(id){
                if(ele_click) {
                    crops_ready.push(ele_click)
                }
                confirm = true
                return false
            }
        })
        if(confirm){
            return true
        }

        // 确认是否待成熟
        var preparing_list = $(element).find('.relative.w-full.h-full')
        if(preparing_list.length){
            if(ele_click) {
                crops_preparing.push(ele_click)
            }
            confirm = true
        }
        if(confirm){
            return true
        }

        // 确认未种植
        if(ele_click) {
            crops_none.push(ele_click)
        }
    })
    return [crops_ready, crops_preparing, crops_none]
}

// 搜寻农场的南瓜汤
function search_pumpkin_soup() {
    var pumpkin_soups = []
    $('.absolute').each(function (index, element) {
        let src = $(element).attr('src')
        if(src){
            let re = RegExp('iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAMAAAAR8Wy4AAAABGdBTUEAALGPC')
            if(src.match(re)){
                pumpkin_soups.push(element)
            }
        }
    })
    return pumpkin_soups
}

// 搜寻农场的泡菜
function search_sauerkrauts() {
    var sauerkrauts = []
    $('.absolute').each(function (index, element) {
        let src = $(element).attr('src')
        if(src){
            let re = RegExp('iVBORw0KGgoAAAANSUhEUgAAAAYAAAAKCAMAAACg0N8BAAAABGdBTUEAALGPC')
            if(src.match(re)){
                sauerkrauts.push(element)
            }
        }
    })
    return sauerkrauts
}

// 搜寻农场的烤花菜
function search_roasted_cauliflowers() {
    var roasted_cauliflowers = []
    $('.absolute').each(function (index, element) {
        let src = $(element).attr('src')
        if(src){
            let re = RegExp('iVBORw0KGgoAAAANSUhEUgAAAA4AAAAJBAMAAADwYwBaAAAABGdBTUEAALGPC')
            if(src.match(re)){
                roasted_cauliflowers.push(element)
            }
        }
    })
    return roasted_cauliflowers
}

// 搜寻未解锁土地坐标范围
function search_locked_farms_rect() {
    var locked_area = null
    var locked_rects = []
    $('img').each(function (index, element) {
        let class_name = $(element).attr('class')
        if(class_name){
            var re = RegExp('absolute z-20 hover:img-highlight cursor-pointer')
            if(class_name.match(re)){
                // 找到了
                let rect = element.getBoundingClientRect()
                locked_rects.push(rect)
                return true
            }

            re = RegExp('absolute z-10 hover:img-highlight cursor-pointer')
            if(class_name.match(re)){
                // 找到了
                let rect = element.getBoundingClientRect()
                locked_rects.push(rect)
            }
        }
    })
    // fake
    // custom_log(['\n未解锁土地数量：', locked_rects.length])
    var left = 0
    var right = 0
    var top = 0
    var bottom = 0
    for(var index in locked_rects) {
        let rect = locked_rects[index]
        if(index == 0) {
            left = rect.x
            right = rect.x + rect.width
            top = rect.y
            if (rect.height <= 60) {
                bottom = rect.y + rect.height*3
            }else {
                bottom = rect.y + rect.height
            }
        }else {
            left = Math.min(left, rect.x)
            right = Math.max(right, rect.x + rect.width)
            top = Math.min(top, rect.y)
            if (rect.height <= 60) {
                bottom = Math.max(bottom, rect.y + rect.height*3)
            }else {
                bottom = Math.max(bottom, rect.y + rect.height)
            }
        }
    }
    if(locked_rects.length == 1) {
        left -= (right - left)
        top -= (bottom - top)/3.0
    }

    if(left || right || top || bottom){
        locked_area = new DOMRect(left, top, right-left, bottom-top)
    }
    return locked_area
}

// 搜寻宝箱
function search_box() {
    var droped = false
    var box = null
    $('.text-center.mb-2').each(function (index, element) {
        let text = $(element).text()
        if(text){
            let re = RegExp('You found a reward')
            if(text.match(re)){
                droped = true
                return false
            }
        }
    })

    if (droped) {
        // 确定宝箱位置
        $('img').each(function (index, element) {
            let class_name = $(element).attr('class')
            if(class_name){
                let re = RegExp('w-16 hover:img-highlight cursor-pointer')
                if(class_name.match(re)){
                    box = element
                    return false
                }
            }
        })
    }

    return [droped, box]
}

// 点击元素
function click_element(element, double_click) {
    let click_rect = element.getBoundingClientRect()
    let click_position = new DOMPoint(click_rect.x+click_rect.width*Math.random()*0.9, click_rect.y+click_rect.height*Math.random()*0.9)
    var mousedown = document.createEvent("MouseEvents");
    mousedown.initMouseEvent("click",true,true,document.defaultView,0,
                click_position.x, click_position.y, click_position.x, click_position.y,false,false,false,false,0,null)
    element.dispatchEvent(mousedown)
    if(double_click) {
        // 双击
        setTimeout(function () {
            element.dispatchEvent(mousedown)
        }, random_interval(0.1, 0.2))
    }
}

// 搜寻Let's farm!
function search_letsfarm() {
    var farm_button = null
    $('button').each(function (index, element) {
        let text = $(element).text()
        if(text){
            let re = RegExp('Let\'s farm!')
            if(text.match(re)){
                farm_button = element
                return false
            }
        }
    })
    return farm_button
}

// 搜寻Something went wrong!
function search_something_wrong() {
    var wrong_status = false
    $('.text-center').each(function (index, element) {
        let text = $(element).text()
        if(text){
            let re = RegExp('Something went wrong')
            if(text.match(re)){
                wrong_status = true
                return false
            }
        }
    })

    if (!wrong_status) {
        $('.text-center.mb-3').each(function (index, element) {
            let text = $(element).text()
            if(text){
                let re_a = RegExp('Session expired')
                if(text.match(re_a)){
                    wrong_status = true
                    return false
                }

                let re_b = RegExp('Too many requests')
                if(text.match(re_b)){
                    wrong_status = true
                    return false
                }
            }
        })
    }
    return wrong_status
}

// 判断是否种子缺失
function seed_needed() {
    var seed_n = true
    $('div').each(function (index, element) {
        let class_name = $(element).attr('class')
        if (class_name) {
            let re = RegExp('flex flex-col items-center sm:mt-8')
            if(class_name.match(re)){
                let seed_list = $(element).find('.relative')
                if (seed_list.length) {
                    let first_seed = seed_list[0]
                    let divs = $(first_seed).find('div div')
                    $(divs).each(function (index, div) {
                        let div_class_name = $(div).attr('class')
                        if (div_class_name) {
                            let div_re = RegExp('bg-silver-300 text-white text-shadow')
                            if (div_class_name.match(div_re)) {
                                // 种子充足
                                seed_n = false
                            }
                        }
                    })
                }
            }
        }
    })
    return seed_n
}

// 检查是否loading
function is_loading() {
    var loading = false
    $('.text-shadow.loading').each(function (index, element) {
        loading = true
        return false
    })
    return loading
}

// 搜索背包种子
function search_bag_seeds() {
    var seed_target = null
    $('.flex.flex-col.pl-2').each(function (index, element) {
        var seed_bar = false
        let p_list = $(element).find('p')
        $(p_list).each(function (p_index, p) {
            let p_text = $(p).text()
            let p_re = RegExp('Seeds')
            if(p_text.match(p_re)){
                seed_bar = true
                return false
            }
        })
        if (seed_bar) {
            var seed_list = $(element).find('div div')
            if (seed_list.length) {
                let first_seed = seed_list[0]
                let seed_imgs = $(first_seed).find('div img')
                if (seed_imgs.length) {
                    seed_target = seed_imgs[0]
                }
            }
            return false
        }
    })
    return seed_target
}

// 搜寻X按钮
function search_x() {
    var img_x = null
    $('.h-6.cursor-pointer.mr-2.mb-1').each(function (index, element) {
        img_x = element
        return false
    })
    return img_x
}

// 搜寻农场编号
function search_farm_id() {
    var farm_id = ''
    $('.text-sm').each(function (index, element) {
        let text = $(element).text()
        let re = /Farm #/
        if(text && text.match(re)) {
            // 找到了
            farm_id = text.replace(re, '')
            return false
        }
    })
    return farm_id
}