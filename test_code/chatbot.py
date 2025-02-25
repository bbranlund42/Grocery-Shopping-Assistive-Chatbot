# import libs
import boto3
import json
from botocore.exceptions import ClientError

def main():
    exit = 0
    iter = 0

    prompt = ''
    prompt_2 = ''
    prompt_3 = ''
    prompt_4 = ''

    response_text = ''
    response_text_2 = ''
    response_text_3 = ''
    response_text_4 = ''

    history = ''

    while(exit == 0):

        if iter == 1:
            prompt_2 = prompt
            response_text_2 = response_text
        elif iter == 2:
            prompt_3 = prompt_2
            response_text_3 = response_text_2

            prompt_2 = prompt
            response_text_2 = response_text
        elif iter > 2:
            prompt_4 = prompt_3
            response_text_4 = response_text_3

            prompt_3 = prompt_2
            response_text_3 = response_text_2

            prompt_2 = prompt
            response_text_2 = response_text

        print(f"\n\nIteration #{iter}\n-----------------------------------------")
        prompt = input("Enter your prompt: ")
        print("\n")

        context = """You are a helpful assistant that helps shoppers 
        in a grocery store with a variety of issues. Please refrain 
        from discussing anything but grocery-store and product-related 
        questions and topics."""

        if iter == 1:
            history = f"""
            <|start_header_id|>user<|end_header_id|>
            {prompt_2}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|
            {response_text_2}
            <eot_id|>
            """
            #print(history)
        elif iter == 2:
            history = f"""
            <|start_header_id|>user<|end_header_id|>
            {prompt_3}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|
            {response_text_3}
            <eot_id|>
            <|start_header_id|>user<|end_header_id|>
            {prompt_2}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|
            {response_text_2}
            <eot_id|>
            """
            #print(history)
        elif iter > 2:
            history = f"""
            <|start_header_id|>user<|end_header_id|>
            {prompt_4}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|
            {response_text_4}
            <eot_id|>
            <|start_header_id|>user<|end_header_id|>
            {prompt_3}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|
            {response_text_3}
            <eot_id|>
            <|start_header_id|>user<|end_header_id|>
            {prompt_2}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|
            {response_text_2}
            <eot_id|>
            """
            #print(history)


        client = boto3.client("bedrock-runtime", region_name="us-east-2")
        model_id = "meta.llama3-3-70b-instruct-v1:0"

        formatted_prompt = f"""
        <|begin_of_text|>
        <|start_header_id|>system<|end_header_id|>
        {context}
        <|eot_id|>
        {history}
        <|start_header_id|>user<|end_header_id|>
        {prompt}
        <|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>
        """

        native_request = {
            "prompt": formatted_prompt,
            "max_gen_len": 256,
            "temperature": 0.5,
        }
        request = json.dumps(native_request)

        prompt_data = """Write me a poem about apples"""
        body = json.dumps({
            "inputText": prompt_data,
        })
        model_id = 'amazon.titan-embed-text-v2:0'
        accept = 'application/json' 
        content_type = 'application/json'
        response = client.invoke_model(
            body=body, 
            modelId=model_id, 
            accept=accept, 
            contentType=content_type
        )
        response_body = json.loads(response['body'].read())
        embedding = response_body.get('embedding')
        print(embedding)

        """
        test_prompt = "Test prompt for embedding."

        try:
            response_embed = client.invoke_model(modelId="amazon.titan-embed-text-v2:0", body=request)
            response_body = json.loads(response_embed['body'].read())
            embedding = response_body['embedding']
            print(embedding)
        except (ClientError, Exception) as e:
            print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}")
            exit(1)
        """
        try:
            response = client.invoke_model(modelId=model_id, body=request)
        except (ClientError, Exception) as e:
            print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}")
            exit(1)

        model_response = json.loads(response["body"].read())

        response_text = model_response["generation"]
        print(response_text)

        iter += 1


main()