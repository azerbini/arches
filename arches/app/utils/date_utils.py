from edtf import parse_edtf, DateAndTime, LongYear
from edtf.parser.edtf_exceptions import EDTFParseException

def date_to_int(val):

    try:
        date = parse_edtf(val)
    except EDTFParseException:
        ## if there's a problem parsing, try this as a long year
        try:
            date = parse_edtf("y{}".format(val))
        except EDTFParseException:
            ## if another parsing problem, try as short year
            date = parse_edtf("{}".format(val.zfill(4)))
        
    # if it's a real DateAndTime (from a date node), must parse it further
    if isinstance(date,DateAndTime):
        date = parse_edtf(str(date.date))
        
    y = int(date.year)*10000
    
    if isinstance(date,LongYear):
        md = "0000"
    else:
        m = int(date.month) if date.month else 0
        d = int(date.day) if date.day else 0
        md = str(m).zfill(2)+str(d).zfill(2)
    
    dateint = y+int(md)
    return dateint
    
def get_year_from_int(val):
    
    val_str = str(int(val))
    y,md = int(val_str[:-4]),int(val_str[-4:])
    if y < 0 and not md == 0:
        y-=1
    
    return y
    