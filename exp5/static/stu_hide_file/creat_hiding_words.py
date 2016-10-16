import pymongo
import motor
import os
db = motor.MotorClient('localhost', 27017).hwweb
sdb = pymongo.MongoClient('localhost', 27017).hwweb
testdb = motor.MotorClient('localhost', 27017).test_hwweb

user_record =sdb.users.find()
path =os.path.dirname(__file__)
source_file=open(path+'/Richard_M. Karp.txt','rb')
source_file.seek(0)
part1=source_file.read(10000)
part2=source_file.read()
for item in user_record:
    filename=item["userId"]+"hiding_words.txt"
    stu_file=open(path+'/'+filename,'wb')
    stu_file.write(part1)
    stu_file.write(item["userId"].encode('Latin1'))
    stu_file.write(part2)
        
