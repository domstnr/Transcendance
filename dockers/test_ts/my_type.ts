
function returnString(): Promise<string>
{
    return new Promise(function(resolve, reject)
    {
        setTimeout(() => resolve("done"), 1000);
    });

}

Promise.resolve(123)
.then ((res) =>
{
    return returnString();
})
.then((res) => 
{
    console.log(res);
});

