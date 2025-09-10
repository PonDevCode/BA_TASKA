

// tính toán giá trị skip phục vụ phân trang

export const pagingSkipValue = (page,itemsPerPage) => {
    // luôn đảm bảo giá trị không hợp lệ thì  turn về 0 hết
    if(!page || !itemsPerPage) return 0
    if(page <= 0 ||itemsPerPage <= 0) return 0
    /**
     *  ví dụ trường hợp mỗi page hiển thị 12 sản phẩm (itemsPerPage == 12)
     * case 01 : user đứng ở page 1 ( page =1 ) thì sẽ lấy 1 - 1 = 0 sao đó nhân với 12 = 0 , lúc này giá trị skip trả về = 0 , nghĩa là ko có 
     * skip bản nghi 
     * case 02 : user đứng ở page 2 ( page = 2) thì sẽ lấy 2 - 1 = 1 sao đó nhân với 12 = 12 , lúc này giá trị skip trả về = 12 , nghĩa là skip
     * 12 bản nghi của 1page trước đó
     *  case 03 : user đứng ở page 2 ( page = 5) thì sẽ lấy 5 - 1 = 4 sao đó nhân với 12 = 48 , lúc này giá trị skip trả về = 48 , nghĩa là skip
     * 12 bản nghi của 4 page trước đó
     */

    return (page - 1 ) * itemsPerPage;
}