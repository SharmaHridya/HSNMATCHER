import json
'''
response = '''
{
    "results": [
        {
            "hsn_code": "01012100",
            "confidence": "high",
            "reason": "The product is specifically described as cattle for breeding."
        },
        {
            "hsn_code": "01021090",
            "confidence": "medium",
            "reason": "It matches live bovine animals but is less specific."
        },
        {
            "hsn_code": "01022100",
            "confidence": "low",
            "reason": "The description is related to cattle but lacks the breeding specificity."
        }
    ]
}
'''

data = json.loads(response)

print(data)
print(type(data))

results=data['results']
for result in results:
    print(result['hsn_code'])
    print(result['reason'])
    print(result['confidence'])
    print('--------------------------')

best_match= results[0]
print(best_match)'''

'''response = 
```json
{
    "results": [
        {
            "hsn_code": "01012100",
            "confidence": "high",
            "reason": "Best match."
        }
    ]
}'''
'''
this method doesnt work as it contains backticks which need to be taken care of first.
data=json.loads(response)'''
