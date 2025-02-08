class ApiFFPS{
    constructor(query, queryreq){
        this.query = query;
        this.queryreq = queryreq;
    }

    //filtering the data
    filter(){
        //using mongoose 6.0 or less
        const exclude = ['sort', 'page', 'limit', 'fields'];
        //creating a shallow obj instead of pointer the reference of req.query
        let queryCopy = {...this.queryreq};
        exclude.forEach((el)=>{
            delete queryCopy[el];
        })

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        const queryObj = JSON.parse(queryStr); //ratings&totalRatings
        
        this.query = this.query.find(queryObj);
        return this;
    }

    //Sorting
    sort(){
        if(this.queryreq.sort){
            const sortBy = this.queryreq.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-createdDate');
        }

        return this;
    }

    //feilds only required fields
    limitFields(){
        if(this.queryreq.fields){
            const fields = this.queryreq.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v');
        }

        return this;
    }

    //pagination
    paginate(){
        const page = this.queryreq.page*1 || 1;
        const limit = this.queryreq.limit*1 || 10;
        const skip = (page-1)*limit;
        this.query = this.query.skip(skip).limit(limit);

        //if(req.queryreq.page){
        //    const moviesCountforPaging = await Movie.countDocuments();
        //    if(skip >= moviesCountforPaging){
        //        throw new Error("No more movies found");
        //    }
        //}

        return this;
    }
}

module.exports = ApiFFPS;